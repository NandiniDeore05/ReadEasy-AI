import React, { useState } from "react";

function QnAInput({ onAsk }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() !== "") {
      onAsk(question);
      setQuestion("");
    }
  };

  return (
    <form className="d-flex mt-3" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-control me-2"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button className="btn btn-success" type="submit">
        Ask
      </button>
    </form>
  );
}

export default QnAInput;
