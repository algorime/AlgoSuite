from googleapiclient.discovery import build
from src.tools.base import BaseTool
from src.exceptions import GoogleSearchError


class GoogleSearchTool(BaseTool):
    """
    A tool for performing Google searches using the Custom Search JSON API.
    """

    def run(self, query: str, num: int = 10) -> str:
        """
        Performs a Google search for the given query.

        Args:
            query: The query to search for.
            num: The number of results to return.

        Returns:
            The search results.
        """
        try:
            api_key = self.settings.GOOGLE_CSE_API_KEY
            cse_cx = self.settings.GOOGLE_CSE_CX

            if not api_key or not cse_cx:
                raise GoogleSearchError(
                    "Google Custom Search API key or CX not found in environment variables."
                )

            service = build("customsearch", "v1", developerKey=api_key)
            res = service.cse().list(q=query, cx=cse_cx, num=num).execute()
            return res.get("items", [])
        except Exception as e:
            raise GoogleSearchError(f"An error occurred: {e}")