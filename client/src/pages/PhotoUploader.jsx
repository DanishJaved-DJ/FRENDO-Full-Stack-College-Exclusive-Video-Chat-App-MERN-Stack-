import React, { useRef, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import Api from '../serverApi/Api';
import Context from '../context/Context';
import CameraCapture from '../components/Cameracapture';

const PhotoUploader = () => {
  const [imageFile, setImageFile] = useState(null); // For device upload
  const [cameraImage, setCameraImage] = useState(null); // For camera capture
  const [loading, setLoading] = useState(false);
  const [takePhoto, setTakePhoto] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { fetchUserDetails } = useContext(Context);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setCameraImage(null); // clear camera capture
      console.log("Selected file:", file);
    }
  };

  const handleUpload = async () => {
    const finalImage = cameraImage || imageFile;
    if (!finalImage) {
      toast.error("Please select or capture an image to upload.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      if (cameraImage) {
        // Convert dataURL to blob
        const res = await fetch(cameraImage);
        const blob = await res.blob();
        formData.append('avatarUrl', blob, 'cameraPhoto.jpg');
      } else {
        formData.append('avatarUrl', finalImage);
      }

      const fetchdata = await fetch(Api.avatar.url, {
        method: Api.avatar.method,
        credentials: 'include',
        body: formData
      });

      const dataResponse = await fetchdata.json();
      if (dataResponse.success) {
        toast.success("Photo uploaded successfully!");
        fetchUserDetails();
        navigate('/home');
        setImageFile(null);
        setCameraImage(null);
      } else {
        toast.error(dataResponse.message || "Failed to upload photo.");
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
      <div className="max-w-md w-full mx-auto p-0 bg-[#262626] rounded-2xl shadow-2xl flex flex-col h-[90%] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#363636] bg-[#262626]">
          <h1 className="text-lg font-bold text-white tracking-wide">Change Profile Photo</h1>
          <Link className="text-[#ed4956] text-base font-semibold hover:underline" to="/home">Cancel</Link>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {cameraImage ? (
            <img src={cameraImage} alt="Captured" className="object-contain max-h-[350px] w-full" />
          ) : imageFile ? (
            <img src={URL.createObjectURL(imageFile)} alt="Selected" className="object-contain max-h-[350px] w-full" />
          ) : takePhoto ? (
            <CameraCapture setCameraImage={setCameraImage} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 text-[#a8a8a8] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
              <p className="text-[#a8a8a8] text-lg font-medium">Select a photo to share</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-[#262626] border-t border-[#363636] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <button
              className="bg-[#262626] border border-[#363636] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#363636] transition"
              onDoubleClick={handleUploadClick}
            >
              Device
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button
              className="bg-[#262626] border border-[#363636] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#363636] transition"
              onClick={() => { setTakePhoto(true); setImageFile(null); setCameraImage(null); }}
            >
              Camera
            </button>
          </div>

          <button
            className={`w-full bg-gradient-to-r from-[#feda75] via-[#fa7e1e] to-[#d62976] text-white font-bold py-2 rounded-lg shadow-md transition ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { PhotoUploader };
