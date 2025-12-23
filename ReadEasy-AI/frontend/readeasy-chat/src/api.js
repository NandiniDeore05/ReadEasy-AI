const BASE_URL = "http://127.0.0.1:5000";

export async function uploadFile(file) {
  console.log("Uploading file:", file.name);
  return { success: true, message: "File uploaded successfully!" };
}

export async function summarizeDoc(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${BASE_URL}/summarize`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to summarize");

    const data = await response.json();
    return { success: true, summary: data.summary };
  } catch (error) {
    console.error("Summarization failed:", error);
    return { success: false, message: "Summarization failed" };
  }
}

export async function askQuestion(file, question) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);

  try {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to get answer");

    const data = await response.json();
    return { success: true, answers: data.answers };
  } catch (error) {
    console.error("Question answering failed:", error);
    return { success: false, message: "Question answering failed" };
  }
}
