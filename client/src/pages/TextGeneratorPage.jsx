import React, { useState, useRef } from 'react';

import ChatContainer from '../components/chat/ChatContainer';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { withErrorHandling, ApiError } from '../utils/error';
import { logError } from '../utils/logger';

function TextGeneratorPage() {
  const [systemMessage, setSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { error, setError, clearError } = useErrorHandler('text-generator');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    clearError();

    const newMessage = {
      content: userMessage.trim(),
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const chatMessages = [];
      if (systemMessage.trim()) {
        chatMessages.push({
          role: 'system',
          content: systemMessage.trim(),
        });
      }
      chatMessages.push({
        role: 'user',
        content: userMessage.trim(),
      });

      const response = await fetch(`${import.meta.env.VITE_API_PATH}/text-generation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          messages: chatMessages,
          max_tokens: 100,
          temperature: 0.7,
          model: 'phi-4',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.detail || 'Failed to generate text',
          response.status,
          'TEXT_GENERATION_ERROR',
          { response: errorData }
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new ApiError(
          data.message || 'Failed to generate text',
          response.status,
          'TEXT_GENERATION_ERROR',
          { response: data }
        );
      }

      setMessages((prev) => [...prev, { content: data.data.text, isUser: false }]);
      setUserMessage('');
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(error.message || 'Failed to generate text', 500, 'TEXT_GENERATION_ERROR', {
              originalError: error,
            });

      logError(apiError, 'text-generator.submit', {
        system_message_length: systemMessage.length,
        user_message_length: userMessage.length,
      });

      setError(apiError.message);
    } finally {
      setIsLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSystemMessageChange = (newMessage) => {
    setSystemMessage(newMessage);
    if (error) clearError();
  };

  const handleUserMessageChange = (newMessage) => {
    setUserMessage(newMessage);
    if (error) clearError();
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-100">
      <div className="relative max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl">
            <ChatContainer
              showSettings={showSettings}
              onSettingsClick={handleSettingsClick}
              systemMessage={systemMessage}
              onSystemMessageChange={handleSystemMessageChange}
              messages={messages}
              error={error}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              userMessage={userMessage}
              inputRef={inputRef}
              onMessageChange={handleUserMessageChange}
              onSubmit={handleSubmit}
              selectedModel="phi-4"
              provider="Codeium"
              models={['phi-4']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withErrorHandling(TextGeneratorPage, 'text-generator');
