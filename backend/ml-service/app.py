import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.ml_api import app

if __name__ == "__main__":
    uvicorn.run("api.ml_api:app", host="0.0.0.0", port=8000, reload=True)
