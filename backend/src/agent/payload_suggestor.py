from typing import Annotated, List, Dict, Any
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import Tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import tools_condition, ToolNode

from ..config import settings
from .model import model
from ..tools.payload_suggestor_sqli import PayloadSuggestorSQLiTool


# Define the simplified state for payload suggestion agent (compatible with LangServe)
class PayloadSuggestorState(TypedDict):
    messages: Annotated[List[AnyMessage], lambda x, y: x + y]


# Instantiate the specialized tool
payload_suggestor_tool = PayloadSuggestorSQLiTool(settings)

# Define the tools for the payload suggestor agent
tools = [
    Tool(
        name="analyze_sqli_payloads",
        func=payload_suggestor_tool.run,
        description="Analyzes HTTP request/response data to suggest SQL injection payloads and optimal injection positions.",
    )
]

# ToolNode for handling tool execution
tool_node = ToolNode(tools)

# System message for the payload suggestor agent
PAYLOAD_SUGGESTOR_SYSTEM_MESSAGE = SystemMessage(content="""
You are a specialized SQL injection payload suggestion agent. Your primary function is to:

1. Analyze HTTP requests and responses for potential SQL injection vulnerabilities
2. Suggest appropriate SQL injection payloads based on the context
3. Identify optimal injection positions within the request
4. Provide clear explanations for your recommendations
5. Guide users on next steps for testing

Key capabilities:
- Detect potential injection points in URL parameters, form data, JSON bodies, and headers
- Analyze response patterns for SQL error indicators
- Suggest context-appropriate payloads (boolean-blind, union-based, time-based, error-based)
- Recommend specific test approaches based on the application's behavior

Always prioritize:
- Safety: Only suggest defensive testing techniques
- Accuracy: Base recommendations on actual analysis of the request/response data
- Clarity: Explain why specific payloads are recommended for specific injection points
- Education: Help users understand SQL injection techniques and detection methods

When a user provides HTTP request/response data, use the analyze_sqli_payloads tool to perform the analysis and then provide clear, actionable recommendations based on the results.
""")


def call_payload_suggestor_model(state):
    """
    Main agent node that processes user input and coordinates tool usage.
    """
    messages = state["messages"]
    
    # Add system message if not already present
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [PAYLOAD_SUGGESTOR_SYSTEM_MESSAGE] + messages
    
    # Bind tools to the model
    model_with_tools = model.bind_tools(tools, parallel_tool_calls=True)
    response = model_with_tools.invoke(messages)
    
    return {"messages": [response]}


# Simplified workflow - no extra processing needed


# Define the LangGraph workflow for payload suggestion (simplified like main agent)
workflow = StateGraph(PayloadSuggestorState)

# Add nodes
workflow.add_node("agent", call_payload_suggestor_model)
workflow.add_node("action", tool_node)

# Define the workflow edges
workflow.set_entry_point("agent")

# Conditional edge: if tools are called, execute them; otherwise end
workflow.add_conditional_edges(
    "agent",
    tools_condition,
    {
        "tools": "action",
        "__end__": END,
    },
)

# After tool execution, return to agent for processing results
workflow.add_edge("action", "agent")

# Compile the workflow into an executable agent
payload_suggestor_agent = workflow.compile()


def create_payload_suggestor_request(http_request: Dict[str, Any], http_response: Dict[str, Any], user_message: str = None) -> Dict[str, Any]:
    """
    Helper function to create a properly formatted request for the payload suggestor agent.
    """
    initial_state = {
        "messages": [],
        "http_request": http_request,
        "http_response": http_response,
        "analysis_result": {}
    }
    
    if user_message:
        initial_state["messages"].append(HumanMessage(content=user_message))
    else:
        initial_state["messages"].append(HumanMessage(content="Please analyze this HTTP request/response for SQL injection opportunities."))
    
    return initial_state