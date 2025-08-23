// src/components/CameraCapture.jsx
import React, { useRef } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user", // "environment" for back camera on mobile
};

const CameraCapture = ({ setCameraImage }) => {
  const webcamRef = useRef(null);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      setCameraImage(screenshot); // send captured photo to parent
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="rounded-lg shadow-md w-full max-h-[350px]"
      />
      <button
        onClick={capturePhoto}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Capture Photo
      </button>
    </div>
  );
};

export default CameraCapture;
