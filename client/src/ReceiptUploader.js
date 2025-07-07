import React, { useState } from 'react';
import axios from 'axios';

function ReceiptUploader({ onParsedItems }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractStatus, setExtractStatus] = useState(null); // Optional: for success/failure messages
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setText("");
      setError("");
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setText("");
    setError("");
  };

const handleUpload = async () => {
  const formData = new FormData();
  formData.append('receipt', file); // name must match multer field

  try {
    const response = await axios.post('/api/receipt/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log("Extracted text:", response.data.text);
  } catch (error) {
    console.error("OCR failed:", error);
    setExtractedText("❌ Failed to extract text from receipt.");
  }
};

  const handleConfirm = () => {
    if (!text.trim()) return;
    onParsedItems(text); // Forward to parent App
  };

  return (
    <div style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>🧾 Upload a Receipt</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {previewUrl && (
        <div style={{ marginTop: '1rem', position: 'relative' }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "200px", borderRadius: "4px" }} />
          <button
            onClick={handleClear}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              width: "24px",
              height: "24px",
            }}
          >
            ×
          </button>
        </div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {text && (
        <>
          <h4>📝 Extracted Text (Editable)</h4>
          <textarea
            rows="10"
            cols="60"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <br />
          <button onClick={handleConfirm} style={{ marginTop: '0.5rem' }}>
            ✅ Confirm Text & Parse
          </button>
        </>
      )}
    </div>
  );
}

export default ReceiptUploader;
