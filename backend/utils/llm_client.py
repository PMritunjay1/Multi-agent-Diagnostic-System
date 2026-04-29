import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load from the repo's .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

# Fallback to standard OPENAI_API_KEY if VITE isn't set
api_key = os.getenv("VITE_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OpenAI API key not found. Please set VITE_OPENAI_API_KEY or OPENAI_API_KEY.")

# Shared async client for all agents
llm_client = AsyncOpenAI(api_key=api_key)
