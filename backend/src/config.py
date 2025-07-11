import os
from dotenv import load_dotenv

# Load environment variables from a .env file if it exists
load_dotenv()

class Settings:
    """
    This class encapsulates all application settings, loading them from environment
    variables. This approach centralizes configuration and makes it easy to
    manage different environments (development, testing, production) without
    changing the code.
    """
    # Azure OpenAI Configuration
    # These settings are for connecting to Azure's OpenAI service.
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")
    AZURE_OPENAI_CHAT_DEPLOYMENT = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT")

    # Qdrant Configuration
    # Qdrant is used as the vector database for embeddings.
    QDRANT_URL = os.getenv("QDRANT_URL")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME")

    # API Server Configuration
    # These settings configure the web server that exposes the application's API.
    # A default value is provided for the host and port to ensure the application
    # can run even if these are not explicitly set in the environment.
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8001))

    # Web Search Configuration
    # These settings are for enabling web search capabilities, supporting both
    # Azure Bing Search and Google Custom Search Engine.
    AZURE_BING_SEARCH_ENDPOINT = os.getenv("AZURE_BING_SEARCH_ENDPOINT")
    AZURE_BING_SEARCH_KEY = os.getenv("AZURE_BING_SEARCH_KEY")

    WEB_SEARCH_BACKEND = os.getenv("WEB_SEARCH_BACKEND")
    GOOGLE_CSE_API_KEY = os.getenv("GOOGLE_CSE_API_KEY")
    GOOGLE_CSE_CX = os.getenv("GOOGLE_CSE_CX")

    # Google Gemini Configuration
    # These settings are for using Google's Gemini models.
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL_PROVIDER = os.getenv("GEMINI_MODEL_PROVIDER")
    GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL")
    GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL")

    # This setting determines the primary model provider for the application.
    MODEL_PROVIDER = os.getenv("MODEL_PROVIDER")

    # Vertex AI Configuration
    # These settings are specifically for using Google's Vertex AI platform.
    GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
    GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")
    GOOGLE_GENAI_USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI")

# Create a single instance of the Settings class that the rest of the application
# can import and use to access configuration values.
settings = Settings()