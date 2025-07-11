from typing import Annotated, List
from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage, SystemMessage
from langchain_core.tools import Tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import tools_condition, ToolNode

from src.config import settings
from .model import model
from .prompt import SYSTEM_MESSAGE
from ..tools.google_search import GoogleSearchTool
from ..tools.knowledge_search import KnowledgeSearchTool
from ..tools.nuclei_scanner import NucleiScannerTool

# Instantiate the tools (with graceful fallbacks)
tools = []

# Google Search Tool (optional)
try:
    google_search_tool = GoogleSearchTool(settings)
    tools.append(Tool(
        name="google_search",
        func=google_search_tool.run,
        description="Performs a Google search.",
    ))
except Exception as e:
    print(f"Warning: Google Search Tool not available: {e}")

# Knowledge Search Tool (optional)
try:
    knowledge_search_tool = KnowledgeSearchTool(settings)
    tools.append(Tool(
        name="knowledge_search",
        func=knowledge_search_tool.run,
        description="Performs a knowledge search.",
    ))
except Exception as e:
    print(f"Warning: Knowledge Search Tool not available: {e}")

# Nuclei Scanner Tool (optional)
try:
    nuclei_scanner_tool = NucleiScannerTool(settings)
    tools.append(Tool(
        name="nuclei_scan",
        func=nuclei_scanner_tool.run,
        description="Runs a Nuclei scan against a URL.",
    ))
except Exception as e:
    print(f"Warning: Nuclei Scanner Tool not available: {e}")

# Ensure we have at least an empty tools list
if not tools:
    print("Warning: No external tools available. Agent will run with basic capabilities only.")
# ToolNode automatically handles parallel execution when multiple tools are called
tool_node = ToolNode(tools)

# Define the agent state
class AgentState(TypedDict):
    messages: Annotated[List[AnyMessage], lambda x, y: x + y]

# Define the agent node with enhanced prompting for multi-tool awareness
def call_model(state):
    messages = state["messages"]
    
    # Add system message if not already present
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SYSTEM_MESSAGE] + messages
    
    # Explicitly enable parallel tool calls (default behavior, but made explicit)
    model_with_tools = model.bind_tools(tools, parallel_tool_calls=True)
    response = model_with_tools.invoke(messages)
    return {"messages": [response]}

# Define the LangGraph workflow with parallel tool execution support
workflow = StateGraph(AgentState)

# Add nodes: agent for LLM calls, action for tool execution
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)  # ToolNode executes multiple tools in parallel

# Define the workflow edges
workflow.set_entry_point("agent")

# Conditional edge: if tools are called, execute them; otherwise end
workflow.add_conditional_edges(
    "agent",
    tools_condition,  # Built-in condition that checks for tool calls
    {
        "tools": "action",  # Execute tools in parallel via ToolNode
        "__end__": END,     # End if no tools to call
    },
)

# After tool execution, return to agent for processing results
workflow.add_edge("action", "agent")

# Compile the workflow into an executable agent
agent = workflow.compile()