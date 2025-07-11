#!/usr/bin/env python3
"""
Simple test script to verify the Payload Suggestor SQLi tool functionality
"""

import json
import sys
import os

# Add the backend source to path
sys.path.append('/home/myadmin/AlgoBrain/backend/src')

try:
    from tools.payload_suggestor_sqli import PayloadSuggestorSQLiTool
    from config import Settings
    
    # Create a mock settings object
    class MockSettings:
        def __init__(self):
            pass
    
    settings = MockSettings()
    
    # Create the tool
    tool = PayloadSuggestorSQLiTool(settings)
    
    # Test data
    test_request = {
        "method": "GET",
        "url": "https://example.com/api/users?id=1&search=admin",
        "headers": {
            "Content-Type": "application/json",
            "User-Agent": "TestClient/1.0"
        },
        "body": ""
    }
    
    test_response = {
        "status_code": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": '{"users": [{"id": 1, "name": "John Doe"}]}'
    }
    
    # Test input
    test_input = {
        "request": test_request,
        "response": test_response
    }
    
    print("🧪 Testing Payload Suggestor SQLi Tool...")
    print("=" * 50)
    
    # Run the analysis
    result = tool.run(json.dumps(test_input))
    
    # Parse and display results
    analysis = json.loads(result)
    
    print(f"✅ Analysis completed successfully!")
    print(f"📍 Injection Points Found: {len(analysis.get('injection_points', []))}")
    print(f"🎯 Payload Suggestions: {len(analysis.get('payload_suggestions', []))}")
    print(f"⚠️  Vulnerability Indicators: {len(analysis.get('vulnerability_indicators', []))}")
    print(f"💡 Recommended Payloads: {len(analysis.get('recommended_payloads', []))}")
    
    print("\n📋 Detailed Results:")
    print("-" * 30)
    
    # Show injection points
    if analysis.get('injection_points'):
        print("\n🎯 Injection Points:")
        for i, point in enumerate(analysis['injection_points'], 1):
            print(f"  {i}. {point['parameter']} ({point['location']}) - Risk: {point['risk_level']}")
    
    # Show payload suggestions
    if analysis.get('payload_suggestions'):
        print("\n💉 Payload Suggestions:")
        for i, payload in enumerate(analysis['payload_suggestions'][:3], 1):  # Show first 3
            print(f"  {i}. {payload['payload']} ({payload['type']}) - Risk: {payload['risk_level']}")
    
    print("\n✅ Payload Suggestor SQLi Tool is working correctly!")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure the backend dependencies are installed")
except Exception as e:
    print(f"❌ Test Failed: {e}")
    import traceback
    traceback.print_exc()