# PRD: Decoupling Knowledge Search from the Payload Suggestor Agent

**1. Problem Statement**

The current Payload Suggestor agent has a hardcoded dependency on the knowledge search functionality. This tight coupling makes the system rigid and difficult to extend. Adding new data sources or search capabilities to the agent requires modifying the agent's core logic, increasing complexity and maintenance overhead.

**2. Proposed Solution**

We propose to decouple the knowledge search functionality from the Payload Suggestor agent by exposing it as a standalone "tool." The agent will be able to access this tool on-demand, just like any other capability.

This change will transform the knowledge search from an internal implementation detail into a modular, reusable component. The agent's responsibility will shift from *performing* the search to *intelligently querying* the search tool when needed.

**3. Goals**

*   **Increased Modularity:** The agent and the knowledge search tool will be independent components.
*   **Improved Extensibility:** New tools and data sources can be added to the agent's arsenal without changing its internal code.
*   **Simplified Agent Logic:** The agent's code will be cleaner and more focused on its primary task of suggesting payloads.
*   **Maintain Simplicity (for now):** The initial version of the knowledge search tool will remain simple: it will take a query, generate embeddings, and return results. No complex logic will be added at this stage.

**4. High-Level Architecture**

This diagram illustrates the intended high-level architecture.

```mermaid
graph TD
    subgraph Payload Suggestor Agent
        A[Agent Logic]
    end
    subgraph Toolset
        B[Knowledge Search Tool]
    end
    A -- "uses" --> B