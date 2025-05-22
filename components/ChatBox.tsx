"use client";

const ChatBox = ({ conversation }: { conversation: SavedMessage[] }) => {
  return (
    <div className="chat-view">
      <div className="chat-header">
        {conversation.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <p className={`message ${message.role}`}>{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatBox;
