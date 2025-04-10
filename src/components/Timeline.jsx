import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import assignLanes from '../assignLanes.js';
import { COLOR_SCHEMES } from '../constants/colors';
import '../styles/Timeline.css';
import { calculateDayWidth, getTimelineDateRange } from '../utils/timelineHelpers';
import TimelineAxis from './TimelineAxis.jsx';
import TimelineItem from './TimelineItem.jsx';

const Timeline = ({ items }) => {
  // Assign color schemes to items if they don't have one
  const initialItems = items.map((item, index) => ({
    ...item,
    colorScheme: item.colorScheme || COLOR_SCHEMES[index % COLOR_SCHEMES.length].name
  }));

  const [timelineItems, setTimelineItems] = useState(initialItems);
  const [zoom, setZoom] = useState(1);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [clickStarted, setClickStarted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  
  // Monitor container width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    // Initial measurement
    updateContainerWidth();
    
    window.addEventListener('resize', updateContainerWidth);
    
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);
  
  const lanes = assignLanes(timelineItems);
  
  const { startDate, endDate, totalDays } = getTimelineDateRange(timelineItems);
  
  const dayWidth = calculateDayWidth(zoom, containerWidth, totalDays);
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.125));
  
  const handleColorChange = (id) => {
    setTimelineItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const currentIndex = COLOR_SCHEMES.findIndex(cs => cs.name === item.colorScheme);
          const nextIndex = (currentIndex + 1) % COLOR_SCHEMES.length;
          return { ...item, colorScheme: COLOR_SCHEMES[nextIndex].name };
        }
        return item;
      })
    );
  };
  
  const handleItemNameChange = (id, newName) => {
    setTimelineItems(prev => 
      prev.map(item => item.id === id ? { ...item, name: newName } : item)
    );
    setEditingItemId(null);
  };
  
  // Handle item resize or drag
  const handleItemUpdate = (id, newStart, newEnd) => {
    setTimelineItems(prev => 
      prev.map(item => item.id === id ? { ...item, start: newStart, end: newEnd } : item)
    );
  };

  // Handle lane change
  const handleLaneChange = (id, newLaneIndex) => {
    const itemToMove = timelineItems.find(item => item.id === id);
    if (!itemToMove) return;

    const targetLaneItems = lanes[newLaneIndex] || [];
    
    // Calculate potential position for the item
    const itemStart = parseISO(itemToMove.start);
    const itemEnd = parseISO(itemToMove.end);
    const itemDuration = differenceInDays(itemEnd, itemStart);
    
    // Check if there's overlap with any item in the target lane
    let hasOverlap = targetLaneItems.some(other => {
      if (other.id === id) return false;
      
      const otherStart = parseISO(other.start);
      const otherEnd = parseISO(other.end);
      
      return (
        (itemStart <= otherEnd && itemEnd >= otherStart) ||
        (otherStart <= itemEnd && otherEnd >= itemStart)
      );
    });
    
    if (hasOverlap) {
      let testStart = itemStart;
      let foundGap = false;
      
      for (let i = 0; i < 30; i++) {
        testStart = addDays(testStart, 1);
        const testEnd = addDays(testStart, itemDuration);
        
        const hasOverlapAtPosition = targetLaneItems.some(other => {
          if (other.id === id) return false;
          
          const otherStart = parseISO(other.start);
          const otherEnd = parseISO(other.end);
          
          return (
            (testStart <= otherEnd && testEnd >= otherStart) ||
            (otherStart <= testEnd && otherEnd >= testStart)
          );
        });
        
        if (!hasOverlapAtPosition) {
          foundGap = true;
          handleItemUpdate(
            id, 
            format(testStart, 'yyyy-MM-dd'),
            format(testEnd, 'yyyy-MM-dd')
          );
          break;
        }
      }
      
      if (!foundGap) {
        return;
      }
    }
  };
  
  // Handle mousedown on timeline
  const handleTimelineMouseDown = (e) => {
    if (e.target === timelineRef.current || e.target.classList.contains('timeline-lane')) {
      setClickStarted(true);
    }
  };
  
  // Handle click on timeline background to create a new item
  const handleTimelineClick = (e) => {

    const isTimelineOrLane = 
      e.target === timelineRef.current || 
      e.target.classList.contains('timeline-lane');
    
    if (isTimelineOrLane && clickStarted && !isResizing && !isDragging) {
      const rect = timelineRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const dayOffset = Math.floor(offsetX / dayWidth);
      const clickDate = addDays(startDate, dayOffset);
      const endDate = addDays(clickDate, 7); // Default 7-day duration
      
      // Assign a color scheme based on distribution
      const colorIndex = timelineItems.length % COLOR_SCHEMES.length;
      
      const newItem = {
        id: Date.now(),
        start: format(clickDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
        name: 'New Event',
        colorScheme: COLOR_SCHEMES[colorIndex].name
      };
      
      setTimelineItems(prev => [...prev, newItem]);
      setEditingItemId(newItem.id);
    }
    
    setClickStarted(false);
  };

  const handleResizeStart = (direction) => {
    setIsResizing(true);
    setResizeDirection(direction);
    setClickStarted(false);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };
  
  return (
    <div className="timeline-container" ref={containerRef}>
      <div className="timeline-controls">
        <button onClick={handleZoomOut}>-</button>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn}>+</button>
      </div>
      
      <div className="timeline-wrapper">
        <TimelineAxis 
          startDate={startDate} 
          totalDays={totalDays} 
          dayWidth={dayWidth} 
        />
        
        <div 
          ref={timelineRef}
          className="timeline" 
          style={{ width: `${totalDays * dayWidth}px` }}
          onClick={handleTimelineClick}
          onMouseDown={handleTimelineMouseDown}
        >
          {lanes.map((lane, laneIndex) => (
            <div key={laneIndex} className="timeline-lane">
              {lane.map(item => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  startDate={startDate}
                  dayWidth={dayWidth}
                  isEditing={editingItemId === item.id}
                  onNameChange={(name) => handleItemNameChange(item.id, name)}
                  onStartEdit={() => setEditingItemId(item.id)}
                  onItemUpdate={handleItemUpdate}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  onResizeStart={handleResizeStart}
                  onResizeEnd={handleResizeEnd}
                  laneIndex={laneIndex}
                  onLaneChange={handleLaneChange}
                  onColorChange={() => handleColorChange(item.id)}
                  colorScheme={item.colorScheme}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;