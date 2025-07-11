from abc import ABC, abstractmethod

from src.config import Settings

class BaseTool(ABC):
    """
    Base class for all tools.
    """

    def __init__(self, settings: Settings):
        self.settings = settings

    @abstractmethod
    def run(self, *args, **kwargs):
        """
        Run the tool.
        """
        raise NotImplementedError