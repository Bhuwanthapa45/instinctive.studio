'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Camera, Loader2, AlertTriangle } from 'lucide-react';

const TimelineComponent = () => {
  // Data state
  const [incidents, setIncidents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Timeline state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timelineWidth, setTimelineWidth] = useState(1200);
  
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const playIntervalRef = useRef(null);

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Dynamic dimensions based on screen size
  const TIMELINE_HEIGHT = isMobile ? 200 : isTablet ? 240 : 280;
  const ROW_HEIGHT = isMobile ? 60 : isTablet ? 70 : 80;
  const HEADER_HEIGHT = isMobile ? 40 : isTablet ? 50 : 60;
  const SIDEBAR_WIDTH = isMobile ? 80 : isTablet ? 100 : 120;
  const HOURS_IN_DAY = 24;
  const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  // Fetch data from your API
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all incidents from your API endpoint
        const response = await fetch('/api/incidents');
        if (!response.ok) {
          throw new Error(`Failed to fetch incidents: ${response.status} ${response.statusText}`);
        }
        
        const incidentsData = await response.json();
        
        // Validate the data structure
        if (!Array.isArray(incidentsData)) {
          throw new Error('Invalid data format: expected array of incidents');
        }
        
        console.log('Fetched incidents:', incidentsData); // Debug log
        setIncidents(incidentsData);
        
        // Extract unique cameras from incidents data
        const uniqueCameras = incidentsData.reduce((acc, incident) => {
          if (incident.camera && !acc.find(c => c.id === incident.camera.id)) {
            acc.push({
              id: incident.camera.id,
              name: incident.camera.name,
              location: incident.camera.location
            });
          }
          return acc;
        }, []);
        
        console.log('Extracted cameras:', uniqueCameras); // Debug log
        setCameras(uniqueCameras);
        
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []); // Only fetch once on mount

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setTimelineWidth(Math.max(800, containerWidth - 32));
        setIsMobile(window.innerWidth < 768);
        setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process incidents for the selected date
  const processedIncidents = useMemo(() => {
    if (!incidents || !Array.isArray(incidents)) return [];
    
    return incidents
      .filter(incident => {
        try {
          const incidentDate = new Date(incident.tsStart);
          const selectedDateStr = selectedDate.toDateString();
          return incidentDate.toDateString() === selectedDateStr;
        } catch (e) {
          console.warn('Invalid incident date:', incident.tsStart);
          return false;
        }
      })
      .map(incident => ({
        ...incident,
        tsStart: new Date(incident.tsStart),
        tsEnd: new Date(incident.tsEnd),
        displayType: mapIncidentType(incident.type),
        color: getIncidentColor(incident.type, incident.resolved)
      }))
      .sort((a, b) => a.tsStart - b.tsStart);
  }, [incidents, selectedDate]);

  // Map incident types to display names
  const mapIncidentType = (type) => {
    const typeMap = {
      'Motion Detection': 'Motion Detected',
      'Person Detected': 'Person Detected', 
      'Vehicle Detected': 'Vehicle Detected',
      'Face Recognition': 'Face Recognised',
      'Unauthorized Access': 'Unauthorised Access',
      'Unauthorised Access': 'Unauthorised Access',
      'Gun Detection': 'Gun Threat',
      'Gun Threat': 'Gun Threat',
      'Traffic Congestion': 'Traffic congestion',
      'Traffic congestion': 'Traffic congestion',
      'Multiple Events': 'Multiple Events'
    };
    return typeMap[type] || type;
  };

  // Get incident color based on type and resolution status
  const getIncidentColor = (type, resolved) => {
    if (resolved) return '#10b981'; // Green for resolved
    
    const colorMap = {
      'Gun Detection': '#dc2626',
      'Gun Threat': '#dc2626',
      'Unauthorized Access': '#ea580c',
      'Unauthorised Access': '#ea580c',
      'Face Recognition': '#2563eb',
      'Face Recognised': '#2563eb',
      'Person Detected': '#2563eb',
      'Traffic Congestion': '#059669',
      'Traffic congestion': '#059669',
      'Vehicle Detected': '#7c3aed',
      'Motion Detection': '#6b7280',
      'Multiple Events': '#f59e0b'
    };
    return colorMap[type] || '#6b7280';
  };

  // Group incidents by camera
  const incidentsByCamera = useMemo(() => {
    const grouped = {};
    
    cameras.forEach(camera => {
      grouped[camera.id] = [];
    });
    
    processedIncidents.forEach(incident => {
      if (grouped[incident.cameraId]) {
        grouped[incident.cameraId].push(incident);
      }
    });
    
    return grouped;
  }, [processedIncidents, cameras]);

  // Convert time to X position on timeline
  const timeToX = useCallback((time) => {
    const dayStart = new Date(time);
    dayStart.setHours(0, 0, 0, 0);
    const timeDiff = time.getTime() - dayStart.getTime();
    return SIDEBAR_WIDTH + (timeDiff / MILLISECONDS_IN_DAY) * (timelineWidth - SIDEBAR_WIDTH);
  }, [timelineWidth, SIDEBAR_WIDTH]);

  // Convert X position to time
  const xToTime = useCallback((x) => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const adjustedX = x - SIDEBAR_WIDTH;
    const timeDiff = (adjustedX / (timelineWidth - SIDEBAR_WIDTH)) * MILLISECONDS_IN_DAY;
    return new Date(dayStart.getTime() + timeDiff);
  }, [selectedDate, timelineWidth, SIDEBAR_WIDTH]);

  // Handle timeline interaction
  const handleTimelineInteraction = useCallback((e) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (x < SIDEBAR_WIDTH) return;
    
    const newTime = xToTime(x);
    setCurrentTime(newTime);
  }, [xToTime, SIDEBAR_WIDTH]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setIsPlaying(false);
    handleTimelineInteraction(e);
  }, [handleTimelineInteraction]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleTimelineInteraction(e);
  }, [isDragging, handleTimelineInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle incident selection
  const handleIncidentClick = useCallback((incident, e) => {
    e.stopPropagation();
    setSelectedIncident(incident);
    setCurrentTime(incident.tsStart);
    console.log('Selected incident:', incident); // For video player integration
  }, []);

  // Handle date change
  const handleDateChange = useCallback((e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    
    // Reset current time to noon of selected date
    const newCurrentTime = new Date(newDate);
    newCurrentTime.setHours(12, 0, 0, 0);
    setCurrentTime(newCurrentTime);
    
    // Clear selected incident
    setSelectedIncident(null);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = new Date(prev.getTime() + 30000);
          const dayEnd = new Date(selectedDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          if (newTime > dayEnd) {
            setIsPlaying(false);
            return dayEnd;
          }
          
          return newTime;
        });
      }, 100);
    } else {
      clearInterval(playIntervalRef.current);
    }

    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, selectedDate]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate hour markers
  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i <= 24; i++) {
      markers.push({
        hour: i,
        x: SIDEBAR_WIDTH + (i / 24) * (timelineWidth - SIDEBAR_WIDTH),
        label: i === 24 ? '00:00' : `${i.toString().padStart(2, '0')}:00`
      });
    }
    return markers;
  }, [timelineWidth, SIDEBAR_WIDTH]);

  const currentX = timeToX(currentTime);

  // Show error state
  if (error) {
    return (
      <div className="w-full bg-[#131313] text-white">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4" size={48} color="#ef4444" />
            <div className="text-red-400 mb-2 text-lg font-medium">Error Loading Timeline</div>
            <div className="text-sm text-gray-400 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="w-full bg-gray-900 text-white">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin mr-3" size={24} />
          <span className="text-lg">Loading timeline data...</span>
        </div>
      </div>
    );
  }

  // Show message if no cameras found
  if (!cameras.length) {
    return (
      <div className="w-full bg-gray-900 text-white">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Camera className="mx-auto mb-4" size={48} color="#6b7280" />
            <div className="text-lg font-medium mb-2">No Camera Data</div>
            <div className="text-sm text-gray-400">No cameras found in the database</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-[#131313] text-white">
      {/* Date Selector */}
      <div className="p-2 sm:p-4 bg-[#131313] border-b border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-sm font-medium text-gray-300">Select Date:</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="bg-gray-700 text-white px-3 py-2 rounded border border-[#131313] focus:border-cyan-400 focus:outline-none text-sm"
          />
          <div className="text-xs text-gray-400">
            Showing {processedIncidents.length} incidents for {selectedDate.toLocaleDateString('en-GB')}
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 bg-gray-800 border-b border-gray-700 gap-2 sm:gap-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
            <SkipBack size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 sm:p-2 hover:bg-gray-700 rounded bg-white text-black transition-colors"
          >
            {isPlaying ? <Pause size={14} className="sm:w-4 sm:h-4" /> : <Play size={14} className="sm:w-4 sm:h-4" />}
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
            <RotateCcw size={14} className="sm:w-4 sm:h-4 scale-x-[-1]" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
            <SkipForward size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock size={14} className="sm:w-4 sm:h-4" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })} ({selectedDate.toLocaleDateString('en-GB')})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 border border-white rounded hover:bg-gray-700 transition-colors">1x</button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-700 rounded transition-colors">
              <Clock size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Incident Info */}
      {selectedIncident && (
        <div className="p-2 sm:p-3 bg-gray-800 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-sm font-medium text-cyan-400">
              {selectedIncident.displayType}
            </div>
            <div className="text-xs text-gray-400">
              {selectedIncident.camera?.name} • {selectedIncident.tsStart.toLocaleTimeString('en-US', { hour12: false })}
              {selectedIncident.resolved && ' • Resolved'}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Container */}
      <div className="relative bg-gray-900 overflow-x-auto" style={{ minHeight: TIMELINE_HEIGHT }}>
        {/* Camera List Header */}
        <div 
          className="absolute top-0 left-0 bg-gray-800 border-r border-cyan-400 z-10"
          style={{ width: SIDEBAR_WIDTH, height: TIMELINE_HEIGHT }}
        >
          <div className="p-2 sm:p-4 border-b border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-cyan-400">
              {isMobile ? 'Cameras' : 'Camera List'}
            </h3>
          </div>
        </div>

        {/* Timeline SVG */}
        <svg
          ref={timelineRef}
          width={timelineWidth}
          height={TIMELINE_HEIGHT}
          className="absolute top-0 left-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          style={{ background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)' }}
        >
          {/* Cyan border */}
          <rect 
            width={timelineWidth} 
            height={TIMELINE_HEIGHT} 
            fill="none" 
            stroke="#06b6d4" 
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Time ruler background */}
          <rect 
            x={SIDEBAR_WIDTH} 
            y={0} 
            width={timelineWidth - SIDEBAR_WIDTH} 
            height={HEADER_HEIGHT} 
            fill="#374151" 
          />

          {/* Hour markers and labels */}
          {hourMarkers.map(marker => (
            <g key={marker.hour}>
              <line
                x1={marker.x}
                y1={HEADER_HEIGHT}
                x2={marker.x}
                y2={TIMELINE_HEIGHT}
                stroke="#4b5563"
                strokeWidth="1"
              />
              <text
                x={marker.x}
                y={isMobile ? 15 : 20}
                textAnchor="middle"
                fontSize={isMobile ? "8" : "10"}
                fill="#d1d5db"
                fontFamily="monospace"
              >
                {isMobile && marker.hour % 2 !== 0 ? '' : marker.label}
              </text>
              
              {/* Quarter hour tick marks (hide on mobile) */}
              {!isMobile && Array.from({ length: 4 }, (_, i) => (
                <line
                  key={i}
                  x1={marker.x + (i + 1) * ((timelineWidth - SIDEBAR_WIDTH) / 24 / 4)}
                  y1={HEADER_HEIGHT - 5}
                  x2={marker.x + (i + 1) * ((timelineWidth - SIDEBAR_WIDTH) / 24 / 4)}
                  y2={HEADER_HEIGHT}
                  stroke="#6b7280"
                  strokeWidth="1"
                />
              ))}
            </g>
          ))}

          {/* Camera rows */}
          {cameras.map((camera, index) => {
            const rowY = HEADER_HEIGHT + (index * ROW_HEIGHT);
            const incidents = incidentsByCamera[camera.id] || [];

            return (
              <g key={camera.id}>
                {/* Row background */}
                <rect
                  x={0}
                  y={rowY}
                  width={timelineWidth}
                  height={ROW_HEIGHT}
                  fill={index % 2 === 0 ? '#1f2937' : '#111827'}
                />
                
                {/* Camera info sidebar */}
                <rect
                  x={0}
                  y={rowY}
                  width={SIDEBAR_WIDTH}
                  height={ROW_HEIGHT}
                  fill="#374151"
                />
                
                {/* Camera icon and label */}
                <g transform={`translate(${isMobile ? 8 : 16}, ${rowY + (isMobile ? 15 : 20)})`}>
                  <Camera size={isMobile ? 12 : 16} fill="#d1d5db" />
                </g>
                <text
                  x={isMobile ? 25 : 40}
                  y={rowY + (isMobile ? 25 : 32)}
                  fontSize={isMobile ? "10" : "12"}
                  fill="#e5e7eb"
                  fontWeight="500"
                >
                  {isMobile ? camera.name.replace('Camera - ', 'C') : camera.name}
                </text>

                {/* Row separator */}
                <line
                  x1={SIDEBAR_WIDTH}
                  y1={rowY}
                  x2={timelineWidth}
                  y2={rowY}
                  stroke="#4b5563"
                  strokeWidth="1"
                />

                {/* Incident markers */}
                {incidents.map(incident => {
                  const startX = timeToX(incident.tsStart);
                  const endX = timeToX(incident.tsEnd);
                  const width = Math.max(3, endX - startX);
                  const centerY = rowY + ROW_HEIGHT / 2;
                  const isSelected = selectedIncident?.id === incident.id;
                  
                  return (
                    <g key={incident.id}>
                      {/* Incident bar */}
                      <rect
                        x={startX}
                        y={centerY - (isMobile ? 8 : 12)}
                        width={width}
                        height={isMobile ? 16 : 24}
                        fill={incident.color}
                        stroke={isSelected ? '#fbbf24' : 'none'}
                        strokeWidth={isSelected ? 2 : 0}
                        rx={isMobile ? 8 : 12}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => handleIncidentClick(incident, e)}
                      />
                      
                      {/* Incident label (hide on mobile if too narrow) */}
                      {width > (isMobile ? 20 : 30) && (
                        <text
                          x={startX + 4}
                          y={centerY - (isMobile ? 4 : 8)}
                          fontSize={isMobile ? "8" : "10"}
                          fill="white"
                          fontWeight="500"
                          className="pointer-events-none"
                        >
                          {incident.displayType.slice(0, isMobile ? 8 : 15)}
                          {incident.displayType.length > (isMobile ? 8 : 15) ? '...' : ''}
                        </text>
                      )}
                      
                      {/* Time label */}
                      {width > (isMobile ? 30 : 40) && (
                        <text
                          x={startX + 4}
                          y={centerY + (isMobile ? 4 : 6)}
                          fontSize={isMobile ? "7" : "9"}
                          fill="#d1d5db"
                          className="pointer-events-none"
                        >
                          {incident.tsStart.toLocaleTimeString('en-US', { 
                            hour12: false, 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Current time scrubber */}
          <g>
            <line
              x1={currentX}
              y1={0}
              x2={currentX}
              y2={TIMELINE_HEIGHT}
              stroke="#fbbf24"
              strokeWidth="2"
            />
            
            {/* Current time indicator at top */}
            <rect
              x={currentX - (isMobile ? 20 : 30)}
              y={5}
              width={isMobile ? 40 : 60}
              height={isMobile ? 16 : 20}
              fill="#fbbf24"
              rx={isMobile ? 8 : 10}
            />
            <text
              x={currentX}
              y={isMobile ? 14 : 18}
              textAnchor="middle"
              fontSize={isMobile ? "8" : "10"}
              fill="#000"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </text>
          </g>
        </svg>
      </div>

      {/* Timeline Stats */}
      <div className="p-2 sm:p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Critical ({processedIncidents.filter(i => !i.resolved && (i.type.includes('Gun') || i.type.includes('Threat'))).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>High ({processedIncidents.filter(i => !i.resolved && i.type.includes('Access')).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Info ({processedIncidents.filter(i => !i.resolved && (i.type.includes('Face') || i.type.includes('Person'))).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Resolved ({processedIncidents.filter(i => i.resolved).length})</span>
          </div>
          <div className="ml-auto text-gray-400">
            Total: {processedIncidents.length} incidents
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineComponent;

