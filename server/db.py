import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Returns a connection to the PostgreSQL database."""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    """Initializes PostgreSQL table schema on startup."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS watch_history (
                id SERIAL PRIMARY KEY,
                media_id VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                progress INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("PostgreSQL Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")