from pydantic import BaseModel, Field
from typing import Optional, List

class Message(BaseModel):
    role: str
    content: str

class TextGenerationRequest(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[List[Message]] = None
    max_tokens: int = Field(default=100, ge=1, le=2000)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    model: str = "phi-4"
    stream: bool = False

    def get_formatted_prompt(self) -> str:
        # If messages are provided, format them in a chat-like style
        if self.messages:
            formatted_prompt = ""
            system_message = None
            conversation = []
            
            # Separate system message from conversation
            for msg in self.messages:
                if msg.role == "system":
                    system_message = msg.content
                else:
                    conversation.append(msg)
            
            # Add system message as context if present
            if system_message:
                formatted_prompt += f"{system_message}\n\n"
            
            # Add conversation messages
            for msg in conversation:
                if msg.role == "user":
                    formatted_prompt += f"Human: {msg.content}\n"
                elif msg.role == "assistant":
                    formatted_prompt += f"Assistant: {msg.content}\n"
            
            # Add final assistant prompt if last message was from user
            if conversation and conversation[-1].role == "user":
                formatted_prompt += "Assistant: "
                
            return formatted_prompt.strip()
        
        # Fall back to direct prompt if no messages
        if self.prompt:
            return self.prompt
            
        raise ValueError("Either prompt or messages must be provided")

class TextGenerationResponse(BaseModel):
    text: str
    tokens_used: int
    model: str

class GenerationHistoryEntry(BaseModel):
    id: str
    user_id: str
    prompt: str
    response: str
    model: str
    created_at: str 