import React, { useState } from "react";
import UploadButton from "./components/UploadButton";
import SummarizeButton from "./components/SummarizeButton";
import QnAInput from "./components/QnAInput";
import ChatWindow from "./components/ChatWindow";
import { uploadFile, summarizeDoc, askQuestion } from "./api";

function App() {
  const [file, setFile] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false); 

  const handleUpload = async (selectedFile) => {
    setFile(selectedFile);
    const response = await uploadFile(selectedFile);
    console.log(response.message);
    alert("File uploaded successfully!");
  };

  const handleSummarize = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    setLoading(true); 
    const result = await summarizeDoc(file);
    setLoading(false); 

    if (result.success) {
      setChats((prev) => [
        ...prev,
        { message: "Here's the summary of your document:", sender: "bot" },
        { message: result.summary, sender: "bot", type: "summary" },
      ]);
    } else {
      alert(result.message);
    }
  };

  const handleAsk = async (question) => {
    if (!file) {
      alert("Please upload a file and summarize it first.");
      return;
    }

    setChats((prev) => [...prev, { message: question, sender: "user" }]);
    const result = await askQuestion(file, question);

    if (result.success) {
      setChats((prev) => [...prev, { message: result.answers, sender: "bot", type: "answer" }]);
    } else {
      setChats((prev) => [
        ...prev,
        { message: result.message || "Something went wrong", sender: "bot" }
      ]);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">ReadEasy Chat</h1>

      <ChatWindow chats={chats} loading={loading} /> 
      <QnAInput onAsk={handleAsk} />
      <SummarizeButton onSummarize={handleSummarize} disabled={loading} />
      <UploadButton onUpload={handleUpload} />
    </div>
  );
}

export default App;
