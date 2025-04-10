/**
 * Helper functions for Timeline component
 */
import { addDays, differenceInDays, parseISO } from 'date-fns';

/**
 * Calculate day width based on zoom level and container width
 * 
 * @param {number} zoom - Current zoom level
 * @param {number} containerWidth - Width of container element
 * @param {number} totalDays - Total number of days in timeline
 * @returns {number} Calculated day width in pixels
 */
export const calculateDayWidth = (zoom, containerWidth, totalDays) => {
  const BASE_DAY_WIDTH = 40;
  
  // Standard calculation
  const standardWidth = Math.max(BASE_DAY_WIDTH * zoom, 5);
  
  // When zoom is small (less than 0.5) and we have container width
  if (zoom < 0.5 && containerWidth > 0) {
    // Calculate width needed to fill container (minus a small padding)
    const fillContainerWidth = (containerWidth - 20) / totalDays;
    
    // Use the larger of fillContainerWidth or the minimum width (5px)
    return Math.max(fillContainerWidth, 5);
  }
  
  return standardWidth;
};

/**
 * Find min and max dates from timeline items
 * 
 * @param {Array} items - Timeline items with start and end dates
 * @returns {Object} Object containing startDate and endDate
 */
export const getTimelineDateRange = (items) => {
  const dates = items.flatMap(item => [parseISO(item.start), parseISO(item.end)]);
  const minDate = dates.reduce((min, date) => (date < min ? date : min), dates[0]);
  const maxDate = dates.reduce((max, date) => (date > max ? date : max), dates[0]);
  
  // Add padding to the timeline
  const startDate = addDays(minDate, -5);
  const endDate = addDays(maxDate, 5);
  
  return { startDate, endDate, totalDays: differenceInDays(endDate, startDate) };
}; 