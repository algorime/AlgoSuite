import logging
from typing import List, Dict, Any
from qdrant_client import QdrantClient, grpc
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from src.config import Settings
from src.tools.base import BaseTool
from src.exceptions import KnowledgeSearchError

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

class KnowledgeSearchTool(BaseTool):
    """
    A tool for performing knowledge searches in a Qdrant collection.
    """

    def __init__(self, settings: Settings):
        super().__init__(settings)
        self.client = self._create_qdrant_client()
        self.embeddings = self._create_gemini_embeddings()

    def _create_qdrant_client(self):
        try:
            qdrant_url = self.settings.QDRANT_URL
            qdrant_api_key = self.settings.QDRANT_API_KEY
            if not all([qdrant_url, qdrant_api_key]):
                raise ValueError(
                    "Qdrant configuration not found in environment variables."
                )
            return QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        except ValueError as e:
            raise KnowledgeSearchError(f"Error initializing Qdrant client: {e}")

    def _create_gemini_embeddings(self):
        try:
            gemini_api_key = self.settings.GEMINI_API_KEY
            if not gemini_api_key:
                raise ValueError(
                    "Gemini API key not found in environment variables."
                )
            return GoogleGenerativeAIEmbeddings(
                model=self.settings.GEMINI_EMBEDDING_MODEL,
                google_api_key=gemini_api_key,
            )
        except ValueError as e:
            raise KnowledgeSearchError(f"Error initializing Gemini embeddings: {e}")

    def run(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Performs a knowledge search in the Qdrant collection.

        Args:
            query: The query to search for.
            limit: The maximum number of results to return.

        Returns:
            A list of the top search results.
        """
        log.info(f"Performing knowledge search with query: '{query}' and limit: {limit}")
        try:
            query_vector = self.embeddings.embed_query(query)
            log.info(f"Successfully generated embeddings for query.")

            search_result = self.client.search(
                collection_name=self.settings.COLLECTION_NAME,
                query_vector=query_vector,
                limit=limit,
            )
            log.info(f"Found {len(search_result)} results from Qdrant.")

            results = [hit.payload for hit in search_result]
            log.debug(f"Search results: {results}")
            return results

        except (grpc.RpcError, ValueError) as e:
            log.error(f"An error occurred during Qdrant search: {e}")
            raise KnowledgeSearchError(f"An error occurred during Qdrant search: {e}")
        except Exception as e:
            log.error(f"An unexpected error occurred during knowledge search: {e}")
            raise KnowledgeSearchError(f"An unexpected error occurred: {e}")