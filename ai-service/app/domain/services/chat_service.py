import uuid
from typing import List, Optional
from app.domain.models.chat_history import ChatHistory, Message
from datetime import datetime

class ChatService:
    def __init__(self):
        self.conversations = {}  # In-memory storage for demo
        
    def create_conversation(self, model_id: Optional[str] = None) -> str:
        conversation_id = str(uuid.uuid4())
        self.conversations[conversation_id] = ChatHistory(
            id=conversation_id,
            messages=[],
            model_id=model_id
        )
        return conversation_id
        
    def add_message(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self.conversations:
            conversation_id = self.create_conversation()
            
        conversation = self.conversations[conversation_id]
        message = Message(role=role, content=content)
        conversation.messages.append(message)
        conversation.updated_at = datetime.utcnow()
        
    def get_conversation(self, conversation_id: str) -> Optional[ChatHistory]:
        return self.conversations.get(conversation_id)
        
    def get_conversation_history(self, conversation_id: str) -> List[dict]:
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return []
            
        return [
            {"role": msg.role, "content": msg.content}
            for msg in conversation.messages
        ]

chat_service = ChatService()  # Singleton instance 