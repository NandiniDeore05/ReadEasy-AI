import React from "react";
import ChatBubble from "./ChatBubble";

function ChatWindow({ chats, loading }) {
  return (
    <div
      className="border rounded p-3 mb-3"
      style={{ height: "400px", overflowY: "auto", backgroundColor: "#f8f9fa" }}
    >
      {chats.map((chat, index) => (
        <ChatBubble key={index} message={chat.message} sender={chat.sender} type={chat.type} />
      ))}

      {loading && (
        <div className="text-center mt-3 text-muted">
          <div className="spinner-border text-secondary" role="status" style={{ width: "2rem", height: "2rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Summarizing, please wait...</div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
