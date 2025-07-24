import IncidentCard from "@/components/IncidentCard";
import IncidentList from "@/components/IncidentList";
import IncidentPlayer from "@/components/IncidentPlayer";
import Navbar from "@/components/Navbar";
import TimelineComponent from "@/components/Timeline";

// app/page.tsx


export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] p-6">
      <Navbar />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Incident Video Player */}
        <div className="md:col-span-2">
          <IncidentPlayer />
        </div>

        {/* Incident List */}
        <div className="md:col-span-1">
          <IncidentList />
        </div>
      </div>
    <TimelineComponent/>
      
    </main>
  );
}
