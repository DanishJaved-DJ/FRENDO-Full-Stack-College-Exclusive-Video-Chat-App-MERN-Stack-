import { useRef, useState } from "react";
import Api from "../serverApi/Api";
import { toast } from "sonner";

const FileUploader = ({ socket, toSocketId }) => {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { // Limit to 10MB
      toast.error("❌ File size exceeds 10MB limit");
      fileInputRef.current.value = ""; // Clear input
      return;
    }
    setSelectedFile(file);

    // Generate preview URL for images, videos, audio
    if (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSend = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const fetchData = await fetch(Api.fileShareApi.url, {
        method: Api.fileShareApi.method,
        body: formData,
      });
      const { fileUrl, fileName, fileType, fileSize } = await fetchData.json();
      
      socket.emit("send-file", {
        to: toSocketId,
        fileUrl,
        fileName,
        fileType,
        fileSize,
      });
      toast.success("📎 File sent");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
    } catch (err) {
      toast.error("❌ File upload failed");
      console.error("File upload error:", err);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-lg hover:scale-105 transition"
        title="Send File"
      >
        {/* Instagram-style paperclip icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-7.07 7.07a6 6 0 108.485 8.485l7.071-7.07" />
        </svg>
      </button>

      {/* Preview Sidebar */}
      {selectedFile && (
        <div className="fixed right-20 bottom-8 h-2/3 w-80 bg-white shadow-lg p-0 z-50 flex flex-col border-l border-gray-200" style={{ maxHeight: "440px", minHeight: "340px" }}>
          {/* Instagram-style header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
            <span className="font-bold text-white tracking-wide">Preview</span>
            <button
              onClick={handleCancel}
              className="text-white hover:text-red-200 text-2xl font-bold"
              style={{ lineHeight: 1 }}
            >
              &times;
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 bg-gradient-to-b from-white via-[#fdf6f0] to-white">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg mb-4 flex items-center justify-center bg-gray-100">
              {previewUrl ? (
                selectedFile.type.startsWith("image/") ? (
                  <img src={previewUrl} alt="preview" className="object-cover w-full h-full" />
                ) : selectedFile.type.startsWith("video/") ? (
                  <video src={previewUrl} controls className="object-cover w-full h-full" />
                ) : selectedFile.type.startsWith("audio/") ? (
                  <audio src={previewUrl} controls className="w-full" />
                ) : null
              ) : (
                <span className="text-gray-400">No preview</span>
              )}
            </div>
            <div className="text-base font-semibold text-gray-800 mb-1 truncate w-full text-center">{selectedFile.name}</div>
            <div className="text-xs text-gray-500 mb-4">{(selectedFile.size / 1024).toFixed(2)} KB</div>
            <button
              onClick={handleSend}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold shadow-md hover:scale-105 transition"
            >
              {isUploading ? "Sending..." : "Send File"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;