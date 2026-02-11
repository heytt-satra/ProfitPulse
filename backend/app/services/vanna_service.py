from vanna.google import GoogleGeminiChat
from vanna.chromadb import ChromaDB_VectorStore
from app.core.config import settings
import logging

# Check if keys are present to avoid startup crashes if optional
API_KEY = settings.GEMINI_API_KEY or "gemini-placeholder"

class ProfitPulseVanna(ChromaDB_VectorStore, GoogleGeminiChat):
    def __init__(self, config=None):
        # Initialize ChromaDB and GoogleGemini components
        ChromaDB_VectorStore.__init__(self, config=config)
        GoogleGeminiChat.__init__(self, config=config)

vanna_config = {
    "api_key": API_KEY,
    "model": "gemini-pro", # Using gemini-pro as default text model
    "path": "./chroma_db" # Local storage for vector/training data
}

# Only initialize if we have a key (or placeholder), but Gemini requires a real key to work.
vn = ProfitPulseVanna(config=vanna_config)

def train_setup():
    """
    Seeds Vanna with the DDL of our FinancialData table.
    Should be called on startup or manually.
    """
    # DDL for our postgres table
    ddl = """
    CREATE TABLE fact_daily_financials (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        date DATE NOT NULL,
        revenue_gross NUMERIC(12, 2) DEFAULT 0,
        revenue_net NUMERIC(12, 2) DEFAULT 0,
        refunds NUMERIC(12, 2) DEFAULT 0,
        disputes NUMERIC(12, 2) DEFAULT 0,
        cost_ads_meta NUMERIC(12, 2) DEFAULT 0,
        cost_ads_google NUMERIC(12, 2) DEFAULT 0,
        cost_transaction_fees NUMERIC(12, 2) DEFAULT 0,
        cost_fixed_allocated NUMERIC(12, 2) DEFAULT 0,
        cost_variable NUMERIC(12, 2) DEFAULT 0,
        currency VARCHAR DEFAULT 'USD',
        transactions_count INTEGER DEFAULT 0,
        orders_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """
    
    try:
        # Check if we already have training data to avoid duplicates (naive check)
        training_data = vn.get_training_data()
        if len(training_data) == 0:
            logging.info("Training Vanna with initial DDL...")
            vn.train(ddl=ddl)
            # Add some documentation examples
            vn.train(documentation="The table fact_daily_financials contains daily aggregated financial metrics for users.")
            vn.train(sql="SELECT sum(revenue_gross) FROM fact_daily_financials WHERE user_id = 'USER_ID' AND date >= '2024-01-01'", description="Total revenue for a user since Jan 2024")
    except Exception as e:
        logging.warning(f"Vanna training check failed: {e}")

# Run setup
if API_KEY != "gemini-placeholder":
    train_setup()
