import asyncio
import logging
import os

import psycopg2
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
DATABASE_URL = os.getenv("DATABASE_URL")
KEEPALIVE_INTERVAL_SECONDS = 120

def get_db_connection():
    """Returns a connection to the PostgreSQL database."""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg2.connect(DATABASE_URL)


def ping_database() -> None:
    """Run a lightweight query so an idle database does not suspend."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
    finally:
        conn.close()


async def keep_database_awake(interval_seconds: int = KEEPALIVE_INTERVAL_SECONDS) -> None:
    """Keep the database active and tolerate transient connection failures."""
    while True:
        try:
            await asyncio.to_thread(ping_database)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Database keep-alive failed; will retry")

        await asyncio.sleep(interval_seconds)

def init_db():
    """Initializes PostgreSQL table schema on startup."""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
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
        finally:
            conn.close()
        print("PostgreSQL Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")