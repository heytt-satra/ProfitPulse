from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.models.user import User
from app.services.vanna_service import vn
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/query", response_model=ChatResponse)
def chat_query(
    request: ChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Ask a natural language question about your financial data.
    Converts text -> SQL -> Data.
    """
    question = request.question
    
    # Security: We need to ensure the AI doesn't access other users' data.
    # We append a strong instruction to the question or filter the SQL.
    # For robust MVP, we inject " for user_id {current_user.id}" into the prompt
    # effectively forcing Vanna to consider the user_id column.
    
    scoped_question = f"{question} (Ensure to filter by user_id = '{current_user.id}')"
    
    try:
        # 1. Generate SQL
        sql_query = vn.generate_sql(scoped_question)
        
        # 2. Safety Check (Basic)
        if "DROP" in sql_query.upper() or "DELETE" in sql_query.upper() or "UPDATE" in sql_query.upper():
            return ChatResponse(sql=sql_query, error="Unsafe SQL generated. Read-only access allowed.")
            
        # 3. Execute SQL
        # We use our own SQLAlchemy session to execute, not Vanna's internal run_sql, 
        # to ensure we use our configured DB connection (which might be the same, but this is safer).
        result = db.execute(text(sql_query))
        
        # Convert result to list of dicts
        keys = result.keys()
        data = [dict(zip(keys, row)) for row in result.fetchall()]
        
        return ChatResponse(
            sql=sql_query,
            data=data,
            explanation="Here is the data I found based on your query."
        )
        
    except Exception as e:
        return ChatResponse(sql="", error=str(e))
