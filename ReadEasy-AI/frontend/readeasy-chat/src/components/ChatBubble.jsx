import React from "react";

function ChatBubble({ message, sender, type }) {
  const isUser = sender === "user";
  console.log("type", type);
  let bubbleClass = "";
  if (isUser) {
    bubbleClass = "bg-primary text-white"; 
  } else if (type === "answer") {
    bubbleClass = "bg-success text-white"; 
  } else if (type === "summary") {
    bubbleClass = "bg-success text-white"; 
  } else {
    bubbleClass = "bg-light text-dark"; 
  }

  return (
    <div
      className={`d-flex mb-3 ${
        isUser ? "justify-content-end" : "justify-content-start"
      }`}
    >
      <div
        className={`p-3 rounded ${bubbleClass}`}
        style={{
          maxWidth: "70%",
          whiteSpace: "pre-line",
          animation: "fadeIn 0.5s",
        }}
      >
        {message}
      </div>
    </div>
  );
}

export default ChatBubble;
