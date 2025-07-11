from typing import List, Dict, Any
import json
from langchain_core.messages import HumanMessage, SystemMessage
from src.tools.knowledge_search import KnowledgeSearchTool
from src.agent.model import model
from src.config import settings

class PayloadSuggestorV2:
    """
    A simplified agent that suggests payloads based on a user's message and database type.
    """

    def __init__(self):
        self.knowledge_search = KnowledgeSearchTool(settings)
        self.model = model

    def run(self, http_request: Dict[str, Any], user_message: str, db_type: str) -> List[Dict[str, Any]]:
        """
        Generates payload suggestions.

        Args:
            http_request: The HTTP request object.
            user_message: The user's message.
            db_type: The database type (e.g., "MySQL", "PostgreSQL").

        Returns:
            A list of suggested payloads.
        """
        knowledge_query = f"{user_message} for {db_type}"
        documents = self.knowledge_search.run(query=knowledge_query, limit=3)

        # Format documents for the prompt
        formatted_documents = "\n".join([f"Document {i+1}:\n{doc['page_content']}\n" for i, doc in enumerate(documents)])

        prompt = f"""
        Based on the following documents, please generate a list of relevant security testing payloads.
        For each payload, provide a brief description and the source document.

        Documents:
        {formatted_documents}

        User message: {user_message}
        HTTP Request: {json.dumps(http_request, indent=2)}
        Database type: {db_type}

        Please return the suggestions in the following JSON format:
        [
            {{
                "payload": "payload string",
                "description": "brief description",
                "source": "content of the source document"
            }}
        ]
        """

        messages = [
            SystemMessage(content="You are a security expert specialized in generating payload suggestions."),
            HumanMessage(content=prompt)
        ]

        response = self.model.invoke(messages)
        
        try:
            # Extract JSON from markdown code block
            json_str = response.content.strip()
            if json_str.startswith("```json"):
                json_str = json_str[7:-4]
            
            suggestions = json.loads(json_str)
            # Ensure the source is correctly associated
            for i, suggestion in enumerate(suggestions):
                if i < len(documents):
                    suggestion['source'] = documents[i]['page_content']
        except (json.JSONDecodeError, IndexError):
            suggestions = []

        return suggestions

    async def ainvoke(self, input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        return self.run(
            http_request=input_data.get("request", {}),
            user_message=input_data.get("user_message", ""),
            db_type=input_data.get("db_type", "")
        )