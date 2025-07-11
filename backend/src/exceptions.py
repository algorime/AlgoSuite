class ToolError(Exception):
    """Base class for tool-related errors."""
    pass

class GoogleSearchError(ToolError):
    """Exception raised for errors in the Google Search tool."""
    pass

class KnowledgeSearchError(ToolError):
    """Exception raised for errors in the Knowledge Search tool."""
    pass

class NucleiScannerError(ToolError):
    """Exception raised for errors in the Nuclei Scanner tool."""
    pass