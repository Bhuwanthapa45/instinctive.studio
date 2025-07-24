'use client';

import { useEffect, useState } from 'react';

type Camera = {
  id: number;
  label: string;
  src: string;
  timestamp: string;
};

export default function IncidentPlayer() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      const res = await fetch('/api/cameras');
      const data = await res.json();
      setCameras(data);
      setActiveCamera(data[0]); // Show Main View by default
    };

    fetchCameras();
  }, []);

  if (!activeCamera) return <div className="text-white">Loading camera feed...</div>;

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden w-full max-w-4xl mx-auto">
      {/* Main video feed */}
      <div className="relative w-full h-[300px] bg-black">
        <video
          src={activeCamera.src}
          controls
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 text-xs rounded">
          {activeCamera.label} • {activeCamera.timestamp}
        </div>
      </div>

      {/* Camera thumbnails */}
      <div className="flex gap-2 p-3 bg-zinc-800">
        {cameras
          .filter((camera) => camera.id !== activeCamera.id)
          .map((camera) => (
            <button
              key={camera.id}
              onClick={() => setActiveCamera(camera)}
              className={`relative w-1/3 h-20 rounded overflow-hidden ring-2 ${
                activeCamera.id === camera.id ? 'ring-blue-400' : 'ring-transparent'
              }`}
            >
              <video
                src={camera.src}
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">
                {camera.label}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}