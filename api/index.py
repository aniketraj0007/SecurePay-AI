# api/index.py - FastAPI Bridge for Vercel
import sys
import os

# Add the project root to sys.path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.main import app

# Vercel needs the "app" object to be available at the module level
# which it already is via the import.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
