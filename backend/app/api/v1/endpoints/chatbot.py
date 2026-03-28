"""
Chatbot endpoints with Gemini AI and PostgreSQL integration
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.services.chatbot_service import ChatbotService
from models.user import User

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatbotMessageRequest(BaseModel):
    message: str
    chat_history: Optional[List[ChatMessage]] = None
    session_id: Optional[str] = None
    language: Optional[str] = "en"  # Language code from cookies


class ChatbotMessageResponse(BaseModel):
    reply: str
    query_type: str  # "general" or "user_specific"
    classification_confidence: float
    requires_login: bool = False


@router.post("/message", response_model=ChatbotMessageResponse)
async def chatbot_message(
    req: ChatbotMessageRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Process chatbot message with intelligent routing:
    - General queries: Handled by Gemini AI
    - User-specific queries: Require login and use PostgreSQL + Gemini
    """
    try:
        # Convert chat history to dict format
        chat_history = None
        if req.chat_history:
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in req.chat_history
            ]
        
        # Debug log
        print(f"Chatbot request - Language: {req.language}, User: {current_user.id if current_user else 'Anonymous'}")
        
        # Create chatbot service instance
        chatbot_service = ChatbotService(db)
        
        # Process message
        user_id = current_user.id if current_user else None
        response = await chatbot_service.process_message(
            message=req.message,
            user_id=user_id,
            chat_history=chat_history,
            language=req.language or "en"
        )
        
        # Check if login is required
        requires_login = (
            response["query_type"] == "user_specific" and not current_user
        )
        
        return ChatbotMessageResponse(
            reply=response["reply"],
            query_type=response["query_type"],
            classification_confidence=response["classification_confidence"],
            requires_login=requires_login
        )
        
    except Exception as e:
        print(f"Chatbot endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred processing your message. Please try again."
        )


@router.get("/health")
def chatbot_health():
    """Check chatbot service health"""
    return {"status": "healthy", "service": "chatbot"}

