from typing import Annotated, List, Dict, Any
import json
import logging
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage
from langchain_core.tools import Tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import tools_condition, ToolNode

from src.config import settings
from .model import model
from ..tools.knowledge_search import KnowledgeSearchTool

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

class PayloadSuggestorAgentState(TypedDict):
    messages: Annotated[List[AnyMessage], lambda x, y: x + y]
    http_request: Dict[str, Any]
    user_message: str
    db_type: str


class PayloadSuggestorAgent:
    """
    A tool-based agent that suggests SQL injection payloads using the knowledge search tool.
    """

    def __init__(self):
        self.agent = self._create_agent()
    
    @property
    def compiled_agent(self):
        """Expose the compiled agent for LangServe integration."""
        return self.agent

    def _create_agent(self):
        """Create the payload suggestor agent with knowledge search tool."""
        tools = []
        
        # Add Knowledge Search Tool
        try:
            knowledge_search_tool = KnowledgeSearchTool(settings)
            tools.append(Tool(
                name="knowledge_search",
                func=knowledge_search_tool.run,
                description="Searches the security knowledge database for relevant SQL injection techniques, payloads, and vulnerability information. Takes a query string and optional limit parameter.",
            ))
        except Exception as e:
            print(f"Warning: Knowledge Search Tool not available in payload suggestor: {e}")

        # Create tool node for tool execution
        tool_node = ToolNode(tools) if tools else None

        # Define system message for payload suggestor
        PAYLOAD_SUGGESTOR_SYSTEM_MESSAGE = SystemMessage(content="""
You are a specialized security expert focused on SQL injection payload generation and analysis.

Your primary task is to analyze HTTP requests and suggest relevant SQL injection payloads based on:
1. The HTTP request structure (method, path, headers, body)
2. The user's specific message or testing scenario
3. The target database type
4. Relevant security knowledge from the knowledge database

When you receive a request for payload suggestions:
1. First, analyze the HTTP request to understand the context.
2. Use the knowledge_search tool to find relevant SQL injection techniques for the specified database type.
3. If the tool returns useful results, generate specific payload suggestions based on the retrieved knowledge.
4. **If the knowledge_search tool returns no results, use your own internal knowledge** to generate relevant and creative SQL injection payloads for the specified database type and user request.
5. Format your response as a JSON array with the following structure:
[
    {
        "payload": "payload string",
        "description": "brief description of what this payload tests",
        "source_index": "index of the source document if applicable, or 'generated' if from your own knowledge"
    }
]

Always provide practical, context-aware payloads. Prioritize results from the knowledge base, but provide your own suggestions if the knowledge base is empty.
""")

        def call_model(state):
            """Call the model with payload suggestor context."""
            messages = state["messages"]
            
            # Add system message if not already present
            if not messages or not isinstance(messages[0], SystemMessage):
                messages = [PAYLOAD_SUGGESTOR_SYSTEM_MESSAGE] + messages
            
            if tools:
                model_with_tools = model.bind_tools(tools)
                response = model_with_tools.invoke(messages)
            else:
                response = model.invoke(messages)
            
            return {"messages": [response]}

        # Create the workflow
        workflow = StateGraph(PayloadSuggestorAgentState)
        
        # Add nodes
        workflow.add_node("agent", call_model)
        if tool_node:
            workflow.add_node("action", tool_node)

        # Set entry point
        workflow.set_entry_point("agent")

        if tools:
            # Add conditional edges for tool execution
            workflow.add_conditional_edges(
                "agent",
                tools_condition,
                {
                    "tools": "action",
                    "__end__": END,
                },
            )
            workflow.add_edge("action", "agent")
        else:
            # If no tools available, just end after agent response
            workflow.add_edge("agent", END)

        return workflow.compile()

    def run(self, http_request: Dict[str, Any], user_message: str, db_type: str) -> List[Dict[str, Any]]:
        """
        Generate payload suggestions using the tool-based agent.
        
        Args:
            http_request: The HTTP request object
            user_message: The user's message
            db_type: The database type (e.g., "MySQL", "PostgreSQL")
            
        Returns:
            A list of suggested payloads
        """
        # Simplify the HTTP request for the prompt
        simplified_request = {
            "method": http_request.get("method"),
            "path": http_request.get("path"),
            "headers": http_request.get("headers", {}),
            "body": http_request.get("body", "")
        }

        # Create the prompt for the agent
        prompt = f"""
Please analyze the following HTTP request and generate SQL injection payload suggestions for {db_type}.

User message: {user_message}
HTTP Request: {json.dumps(simplified_request, indent=2)}
Database type: {db_type}

First, search for relevant SQL injection knowledge for {db_type}, then provide payload suggestions in JSON format.
"""

        # Invoke the agent
        initial_state = {
            "messages": [HumanMessage(content=prompt)],
            "http_request": http_request,
            "user_message": user_message,
            "db_type": db_type
        }

        log.info(f"Invoking payload suggestor agent with initial state...")
        log.debug(f"Initial prompt for agent: {prompt}")

        result = self.agent.invoke(initial_state)
        
        # Extract and parse the final response
        final_message = result["messages"][-1]
        log.info(f"Received response from agent.")
        log.debug(f"Raw response from agent: {final_message.content}")
        
        try:
            # Extract JSON from the response
            content = final_message.content.strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                # Handle generic code blocks
                lines = content.split('\n')
                if len(lines) > 1:
                    content = '\n'.join(lines[1:-1])
            
            suggestions = json.loads(content)
            log.info(f"Successfully parsed {len(suggestions)} suggestions from response.")
            
            # Ensure we return a list
            if not isinstance(suggestions, list):
                log.warning("Parsed suggestions are not a list, returning empty list.")
                suggestions = []
                
        except (json.JSONDecodeError, AttributeError, IndexError) as e:
            log.error(f"Failed to parse JSON from agent response: {e}")
            log.debug(f"Content that failed to parse: {final_message.content}")
            # Fallback: create a basic suggestion if parsing fails
            suggestions = [{
                "payload": "' OR 1=1--",
                "description": "Basic SQL injection test payload (fallback)",
                "source_index": "generated"
            }]

        return suggestions

    async def ainvoke(self, input_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Async wrapper for the run method."""
        return self.run(
            http_request=input_data.get("request", {}),
            user_message=input_data.get("user_message", ""),
            db_type=input_data.get("db_type", "")
        )