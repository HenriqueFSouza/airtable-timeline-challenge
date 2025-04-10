import { addDays, format } from 'date-fns';
import React from 'react';
import '../styles/TimelineAxis.css';

const TimelineAxis = ({ startDate, totalDays, dayWidth }) => {
  // Generate date ticks based on zoom level with improved intervals to prevent overlapping
  const tickInterval = 
    dayWidth < 3 ? 30 :
    dayWidth < 5 ? 21 :
    dayWidth < 10 ? 14 : 
    dayWidth < 20 ? 7 : 
    dayWidth < 40 ? 3 : 1;
    
  const dateTicksCount = Math.ceil(totalDays / tickInterval);
  const dateTicks = Array.from({ length: dateTicksCount }, (_, i) => {
    const date = addDays(startDate, i * tickInterval);
    // Use more compact date format when zoomed out to prevent overlapping
    const dateFormat = 
      dayWidth < 3 ? 'M' :
      dayWidth < 5 ? 'MMM' :
      tickInterval >= 14 ? 'MMM' :
      tickInterval >= 7 ? 'MMM d' :
      tickInterval >= 3 ? 'MMM d' :
      dayWidth < 60 ? 'd' : 'MMM d, yyyy';
    
    return { 
      date, 
      position: i * tickInterval * dayWidth,
      label: format(date, dateFormat)
    };
  });
  
  // Generate month dividers
  const months = [];
  let currentMonthStart = null;
  let currentPosition = 0;
  
  for (let day = 0; day <= totalDays; day++) {
    const date = addDays(startDate, day);
    
    // If this is the first day or the first day of a new month
    if (day === 0 || date.getDate() === 1) {
      if (currentMonthStart) {
        // Add the previous month to the array
        const monthFormat = 
          dayWidth < 3 ? 'M' :
          dayWidth < 5 ? 'MMM' :
          dayWidth < 20 ? 'MMM' : 'MMMM yyyy';
          
        months.push({
          month: format(currentMonthStart, monthFormat),
          position: currentPosition,
          width: day * dayWidth - currentPosition
        });
      }
      
      currentMonthStart = date;
      currentPosition = day * dayWidth;
    }
    
    // Add the last month
    if (day === totalDays) {
      const monthFormat = 
        dayWidth < 3 ? 'M' :
        dayWidth < 5 ? 'MMM' :
        dayWidth < 20 ? 'MMM' : 'MMMM yyyy';
        
      months.push({
        month: format(currentMonthStart, monthFormat),
        position: currentPosition,
        width: totalDays * dayWidth - currentPosition
      });
    }
  }

  // Determine if we should display month labels based on width
  const showMonthLabels = dayWidth >= 2;
  const showDateTicks = dayWidth >= 1.5;

  return (
    <div className="timeline-axis" style={{ width: `${totalDays * dayWidth}px` }}>
      {showMonthLabels && (
        <div className="month-labels">
          {months.map((month, index) => (
            <div 
              key={index}
              className="month-label"
              style={{
                left: `${month.position}px`,
                width: `${month.width}px`
              }}
            >
              {month.month}
            </div>
          ))}
        </div>
      )}
      
      {showDateTicks && (
        <div className="date-ticks">
          {dateTicks.map((tick, index) => (
            <div 
              key={index}
              className="date-tick"
              style={{ 
                left: `${tick.position}px`,
                width: `${tickInterval * dayWidth}px` 
              }}
            >
              <div className="tick-line"></div>
              <div className="tick-label">{tick.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineAxis; 