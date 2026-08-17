import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """Configure a simple, consistent logging format for the app."""
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        stream=sys.stdout,
    )
