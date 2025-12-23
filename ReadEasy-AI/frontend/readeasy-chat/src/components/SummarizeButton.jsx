import React from "react";

function SummarizeButton({ onSummarize, disabled }) {
  return (
    <div className="my-3">
      <button
        className="btn btn-success"
        onClick={onSummarize}
        disabled={disabled}
      >
        {disabled ? "Summarizing..." : "Summarize"}
      </button>
    </div>
  );
}

export default SummarizeButton;
