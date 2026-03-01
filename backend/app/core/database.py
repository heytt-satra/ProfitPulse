from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

database_url = settings.DATABASE_URL
is_sqlite = database_url.startswith("sqlite")

engine_kwargs = {"pool_pre_ping": True}
if is_sqlite:
    # SQLite requires different connect args and no pool timeout setting.
    engine_kwargs["connect_args"] = {"check_same_thread": False, "timeout": 10}
else:
    engine_kwargs["pool_timeout"] = 10
    engine_kwargs["connect_args"] = {"connect_timeout": 10}

engine = create_engine(database_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
