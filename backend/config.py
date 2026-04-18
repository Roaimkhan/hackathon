import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
