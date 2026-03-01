import logging
from sqlalchemy import create_engine, text
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_user():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT email, id FROM users WHERE email = 'heyttsatra17@gmail.com'"))
        user = result.fetchone()
        if user:
            logger.info(f"User found: {user.email}, ID: {user.id}")
        else:
            logger.info("User not found.")

if __name__ == "__main__":
    check_user()
