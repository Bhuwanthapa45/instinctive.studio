"use client";

import { useEffect, useState } from "react";
import IncidentCard from "./IncidentCard";
import { ShieldAlert } from "lucide-react";
import { CheckCheck } from "lucide-react";


type Incident = {
  id: number;
  type: string;
  thumbnailUrl: string;
  tsStart: string;
  tsEnd: string;
  camera: { location: string };
  resolved: boolean;
};

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [fadingId, setFadingId] = useState<number | null>(null);

  const fetchIncidents = async () => {
    const res = await fetch("/api/incidents");
    const data = await res.json();
    setIncidents(data);
  };

  const handleResolve = async (id: number) => {
    setFadingId(id);
    setTimeout(async () => {
      try {
        await fetch(`/api/incidents/${id}/resolve`, { method: "PATCH" });

        setIncidents((prev) => {
          const updated = prev.map((incident) =>
            incident.id === id ? { ...incident, resolved: true } : incident
          );
          return updated.sort(
            (a, b) => Number(a.resolved) - Number(b.resolved)
          );
        });
        setFadingId(null);
      } catch (error) {
        console.error("Failed to resolve incident:", error);
        setFadingId(null);
      }
    }, 300);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const resolvedCount = incidents.filter((i) => i.resolved).length;
  const unresolvedCount = incidents.filter((i) => !i.resolved).length;

  return (
    <div className="flex flex-col h-[400px] overflow-auto">
      {/* <div className="flex items-center justify-between text-sm mb-4 px-2">
        <div className="flex pl-2">
          <ShieldAlert color="#ad1010" />
          <span className="text-red-100 font-bold text-[15px]">
            {unresolvedCount} : Unresolved Incidents
          </span>
        </div>
        <div className="flex pl-2">
          {" "}
          <CheckCheck color="#3fc819" />
          <span className="text-green-100 font-light border-[0.5px] border-white rounded-2xl">
            {resolvedCount} : Resolved Incidents
          </span>
        </div>
      </div> */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500" size={18} />
          <span className="text-sm font-semibold text-red-100">
            {unresolvedCount} Unresolved Incidents
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCheck className="text-green-400" size={18} />
          <span className="text-sm text-green-200 border border-green-300 rounded-full px-3 py-1">
            {resolvedCount} Resolved Incidents
          </span>
        </div>
      </div>

      {incidents.length === 0 && (
        <p className="text-gray-500 text-sm px-2">No incidents found.</p>
      )}

      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          isFading={fadingId === incident.id}
          onResolve={handleResolve}
        />
      ))}
    </div>
  );
}
