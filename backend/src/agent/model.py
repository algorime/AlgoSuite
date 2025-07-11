from langchain_google_genai import ChatGoogleGenerativeAI
from ..config import settings

# Initialize the Gemini model
model = ChatGoogleGenerativeAI(
    model=settings.GEMINI_CHAT_MODEL,
    google_api_key=settings.GEMINI_API_KEY
)