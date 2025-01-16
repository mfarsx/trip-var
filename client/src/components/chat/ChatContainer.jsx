import React from 'react';
import PropTypes from 'prop-types';
import ChatHeader from './ChatHeader';
import SettingsPanel from './SettingsPanel';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatContainer = ({
  showSettings,
  onSettingsClick,
  systemMessage,
  onSystemMessageChange,
  messages,
  error = null,
  isLoading,
  messagesEndRef,
  userMessage,
  inputRef,
  onMessageChange,
  onSubmit,
  selectedModel = null,
  onModelChange = () => {},
  provider = null,
  models = [],
}) => (
  <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
    <ChatHeader onSettingsClick={onSettingsClick} />

    {showSettings && (
      <SettingsPanel
        systemMessage={systemMessage}
        onSystemMessageChange={onSystemMessageChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        provider={provider}
        models={models}
      />
    )}

    <MessageList
      ref={messagesEndRef}
      messages={messages}
      error={error}
      isLoading={isLoading}
    />

    <ChatInput
      ref={inputRef}
      value={userMessage}
      onChange={onMessageChange}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  </div>
);

ChatContainer.propTypes = {
  showSettings: PropTypes.bool.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  systemMessage: PropTypes.string.isRequired,
  onSystemMessageChange: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      isUser: PropTypes.bool.isRequired
    })
  ).isRequired,
  error: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  userMessage: PropTypes.string.isRequired,
  inputRef: PropTypes.object.isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedModel: PropTypes.string,
  onModelChange: PropTypes.func,
  provider: PropTypes.string,
  models: PropTypes.arrayOf(PropTypes.string),
};

export default ChatContainer;
