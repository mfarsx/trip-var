import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import ErrorMessage from './ErrorMessage';
import Message from './Message';

const MessageList = forwardRef(({ messages, error, isLoading }, ref) => (
  <div className="flex-grow overflow-y-auto space-y-6 py-4">
    <div className="max-w-5xl mx-auto">
      <ErrorMessage message={error} />

      <div className="space-y-6">
        {messages.map((message, index) => (
          <Message key={index} content={message.content} isUser={message.isUser} />
        ))}
        {isLoading && <Message content="" isLoading={true} isUser={false} />}
      </div>
      <div ref={ref} />
    </div>
  </div>
));

MessageList.displayName = 'MessageList';

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      isUser: PropTypes.bool.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default MessageList;
