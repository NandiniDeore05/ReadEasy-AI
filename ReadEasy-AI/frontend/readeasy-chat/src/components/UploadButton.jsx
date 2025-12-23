import React from "react";

function UploadButton({ onUpload }) {
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="mt-3">
      <input type="file" className="form-control" onChange={handleFileChange} />
    </div>
  );
}

export default UploadButton;
