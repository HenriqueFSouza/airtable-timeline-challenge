import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import '../styles/TimelineItem.css';
import { throttle } from '../utils/functions';
import { createDragShadow, getColorProperties } from '../utils/timelineItemHelpers';

const TimelineItem = ({ 
  item, 
  startDate, 
  dayWidth, 
  isEditing, 
  onNameChange, 
  onStartEdit, 
  onItemUpdate,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
  laneIndex,
  onLaneChange,
  colorScheme = 'primary',
  onColorChange
}) => {
  const [name, setName] = useState(item.name);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const itemRef = useRef(null);
  const inputRef = useRef(null);
  const shadowRef = useRef(null);
  const dragMoveHandler = useRef(null);
  const dragEndHandler = useRef(null);
  const isDraggingRef = useRef(false);
  
  const { background, border } = getColorProperties(item.colorScheme);
  
  // Calculate position and width based on dates
  const itemStartDate = parseISO(item.start);
  const itemEndDate = parseISO(item.end);
  const leftOffset = differenceInDays(itemStartDate, startDate) * dayWidth;
  const width = (differenceInDays(itemEndDate, itemStartDate) + 1) * dayWidth; // +1 to include end date
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Update name when item changes
  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  // Clean up drag shadow and event listeners on unmount
  useEffect(() => {
    return () => {
      removeDragShadow();
      cleanupDragListeners();
    };
  }, []);

  // Handle right-click to change color
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onColorChange) {
      onColorChange();
    }
  };
  
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onNameChange(name);
  };

  const removeDragShadow = () => {
    if (shadowRef.current && shadowRef.current.parentNode) {
      shadowRef.current.parentNode.removeChild(shadowRef.current);
      shadowRef.current = null;
    }
  };

  const cleanupDragListeners = () => {
    if (dragMoveHandler.current) {
      document.removeEventListener('mousemove', dragMoveHandler.current);
      dragMoveHandler.current = null;
    }
    if (dragEndHandler.current) {
      document.removeEventListener('mouseup', dragEndHandler.current);
      dragEndHandler.current = null;
    }
  };

  const updateDragShadowPosition = (x, y) => {
    if (!shadowRef.current) return;
    
    const timeline = itemRef.current.closest('.timeline');
    const timelineRect = timeline.getBoundingClientRect();
    const lanes = timeline.querySelectorAll('.timeline-lane');
    
    // Calculate horizontal position
    const newLeft = x - timelineRect.left - dragOffset;
    const dayPosition = Math.round(newLeft / dayWidth);
    const snapLeft = dayPosition * dayWidth;
    
    let newLane = null;
    for (let i = 0; i < lanes.length; i++) {
      const laneRect = lanes[i].getBoundingClientRect();
      if (y >= laneRect.top && y <= laneRect.bottom) {
        newLane = i;
        break;
      }
    }
    
    // Update shadow position
    shadowRef.current.style.left = `${snapLeft}px`;
    
    if (newLane !== null && lanes[newLane]) {
      const laneTop = lanes[newLane].offsetTop;
      shadowRef.current.style.top = `${laneTop + 5}px`;
    }
  };
  
  const handleDragStart = (e) => {
    if (isEditing || 
        isResizing || 
        e.target.classList.contains('resize-handle') || 
        e.target.closest('.resize-handle')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();

    removeDragShadow();
    cleanupDragListeners();
    
    const rect = itemRef.current.getBoundingClientRect();
    setDragOffset(e.clientX - rect.left);
    isDraggingRef.current = true;
    onDragStart();
    
    shadowRef.current = createDragShadow(
      itemRef.current, 
      item, 
      width, 
      { background, border }, 
      itemStartDate, 
      itemEndDate
    );
    
    if (shadowRef.current) {
      updateDragShadowPosition(e.clientX, e.clientY);
    }
    
    const moveHandler = (moveEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      if (isDraggingRef.current && shadowRef.current) {
        updateDragShadowPosition(moveEvent.clientX, moveEvent.clientY);
      }
    };
    
    const endHandler = (upEvent) => {
      if (isDraggingRef.current) {
        handleDragEnd(upEvent);
      }
      
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', endHandler);
    };
    
    dragMoveHandler.current = moveHandler;
    dragEndHandler.current = endHandler;
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    
    moveHandler(e);
  };
  
  const handleDragEnd = (e) => {
    if (!isDraggingRef.current) return;
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Calculate final position from shadow
    if (shadowRef.current) {
      const timeline = itemRef.current.closest('.timeline');
      const shadowLeft = shadowRef.current.offsetLeft;
      const dayPosition = Math.round(shadowLeft / dayWidth);
      const newStartDate = addDays(startDate, dayPosition);
      const newEndDate = addDays(newStartDate, differenceInDays(itemEndDate, itemStartDate));
      
      // Find which lane the shadow is in
      const lanes = timeline.querySelectorAll('.timeline-lane');
      let targetLane = laneIndex;
      
      for (let i = 0; i < lanes.length; i++) {
        const laneRect = lanes[i].getBoundingClientRect();
        const shadowRect = shadowRef.current.getBoundingClientRect();
        const shadowMiddleY = shadowRect.top + shadowRect.height / 2;
        
        if (shadowMiddleY >= laneRect.top && shadowMiddleY <= laneRect.bottom) {
          targetLane = i;
          break;
        }
      }
      
      onItemUpdate(
        item.id, 
        format(newStartDate, 'yyyy-MM-dd'),
        format(newEndDate, 'yyyy-MM-dd')
      );
      
      if (targetLane !== laneIndex) {
        onLaneChange(item.id, targetLane);
      }
    }
    
    removeDragShadow();
    cleanupDragListeners();
    isDraggingRef.current = false;
    onDragEnd();
  };
  
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isEditing || isDraggingRef.current) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    onResizeStart(direction);
    
    const moveHandler = e => handleResizeMove(e, direction);
    const endHandler = () => {
      setIsResizing(false);
      onResizeEnd();
      
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', endHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
  };
  
  const handleResizeMove = throttle((e, direction) => {
    const timelineRect = itemRef.current.parentElement.parentElement.getBoundingClientRect();
    const mouseX = e.clientX - timelineRect.left;
    
    if (direction === 'left') {
      const dayPosition = Math.round(mouseX / dayWidth);
      const newStartDate = addDays(startDate, dayPosition);
      
      if (newStartDate < itemEndDate) {
        onItemUpdate(
          item.id, 
          format(newStartDate, 'yyyy-MM-dd'), 
          item.end
        );
      }
    } else if (direction === 'right') {
      const dayPosition = Math.round(mouseX / dayWidth);
      const newEndDate = addDays(startDate, dayPosition);
      
      if (newEndDate > itemStartDate) {
        onItemUpdate(
          item.id, 
          item.start, 
          format(newEndDate, 'yyyy-MM-dd')
        );
      }
    }
  }, 50);
  
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onStartEdit();
  };
  
  return (
    <div
      ref={itemRef}
      className={`timeline-item ${isEditing ? 'active' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: `${leftOffset}px`,
        width: `${width}px`,
        backgroundColor: background,
        borderColor: border
      }}
      data-color={item.colorScheme}
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      draggable={false}
    >
      <div className="resize-handle left" onMouseDown={(e) => handleResizeStart(e, 'left')}></div>
      
      <div className="item-content">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="item-name-input"
              value={name}
              onChange={handleNameChange}
              onBlur={handleSubmit}
            />
          </form>
        ) : (
          <>
            <div className="item-name">{item.name}</div>
            <div className="item-dates">
              {format(itemStartDate, 'MMM d')} - {format(itemEndDate, 'MMM d, yyyy')}
            </div>
            
          </>
        )}
      </div>
      
      <div className="resize-handle right" onMouseDown={(e) => handleResizeStart(e, 'right')}></div>
    </div>
  );
};

export default TimelineItem; 