'use client';

import { useState } from 'react';
import { Cctv } from 'lucide-react';
import { Timer } from 'lucide-react';

type Incident = {
  id: number;
  type: string;
  thumbnailUrl: string;
  tsStart: string;
  tsEnd: string;
  camera: { location: string };
  resolved: boolean;
};

export default function IncidentCard({
  incident,
  isFading,
  onResolve,
}: {
  incident: Incident;
  isFading: boolean;
  onResolve: (id: number) => void;
}) {
  const [isResolving, setIsResolving] = useState(false);
  const [localResolved, setLocalResolved] = useState(incident.resolved);

  const handleResolve = async () => {
    setIsResolving(true);
    await onResolve(incident.id);
    setLocalResolved(true);
    setIsResolving(false);
  };

  return (
    <div
      className={`flex gap-4 p-3 rounded-lg bg-[#131313] shadow-sm border mb-4 transition-all duration-300 ${
        isFading ? 'opacity-0 translate-y-4' : 'opacity-100'
      }`}
    >
      <img
        src={incident.thumbnailUrl}
        alt="Thumbnail"
        className="w-24 h-24 rounded object-cover"
      />
      {/* <div className="flex-1">
        <div className="text-sm text-gray-100 mb-1">{incident.type}</div>
        
        <div className="text-xs font-light text-gray-200">{incident.camera.location}</div>
        <div className="text-xs text-gray-200">
          {new Date(incident.tsStart).toLocaleString()} →{' '}
          {new Date(incident.tsEnd).toLocaleTimeString()}
        </div>
      </div> */}
      <div className="flex-1 space-y-1 text-gray-100 text-sm">
  {/* Incident Type */}
  <div className="font-medium">{incident.type}</div>

  {/* Camera Location */}
  <div className="flex items-center gap-1 text-xs text-gray-300">
    <Cctv className="w-4 h-4" />
    <span>{incident.camera.location}</span>
  </div>

  {/* Timestamp */}
  <div className="text-xs text-gray-400">
    
    {new Date(incident.tsStart).toLocaleString()} →{' '}
    {new Date(incident.tsEnd).toLocaleTimeString()}
  </div>
</div>

      <button
        className="self-start px-3 py-1 text-[#FFCC01] rounded disabled:opacity-50"
        disabled={localResolved || isResolving}
        onClick={handleResolve}
      >
        {localResolved ? 'Resolved' : isResolving ? 'Resolving...' : 'Resolve'}
      </button>
    </div>
  );
}
