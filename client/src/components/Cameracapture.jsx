// src/components/CameraCapture.jsx
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user", // use "environment" for back camera on mobile
};

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capturePhoto = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
  };

  const retakePhoto = () => setImage(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {!image ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="rounded-lg shadow-md"
          />
          <button
            onClick={capturePhoto}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Capture Photo
          </button>
        </>
      ) : (
        <>
          <img src={image} alt="Captured" className="rounded-lg shadow-md" />
          <button
            onClick={retakePhoto}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
          >
            Retake
          </button>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
