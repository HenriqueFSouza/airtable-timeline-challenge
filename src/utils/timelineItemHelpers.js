/**
 * Helper functions for TimelineItem component
 */
import { format } from 'date-fns';

/**
 * Get color properties based on color scheme
 * @param {string} colorScheme - Name of the color scheme
 * @returns {Object} Background and border colors
 */
export const getColorProperties = (colorScheme) => {
  // Default colors (primary blue)
  let background = '#e3f2fd';
  let border = '#b3e5fc';
  
  // Apply color scheme if defined
  if (colorScheme === 'secondary') {
    background = '#e1f5fe';
    border = '#81d4fa';
  } else if (colorScheme === 'tertiary') {
    background = '#e8eaf6';
    border = '#9fa8da';
  }
  
  return { background, border };
};

/**
 * Creates a drag shadow element for dragging TimelineItems
 * @param {HTMLElement} itemRef - Reference to the timeline item element
 * @param {Object} item - Timeline item data
 * @param {number} width - Width of the item
 * @param {Object} colors - Color properties for the item
 * @param {Date} itemStartDate - Start date of the item
 * @param {Date} itemEndDate - End date of the item
 * @returns {HTMLElement|null} The created shadow element or null
 */
export const createDragShadow = (itemRef, item, width, colors, itemStartDate, itemEndDate) => {
  if (!itemRef) return null;
  
  const timeline = itemRef.closest('.timeline');
  if (!timeline) return null;

  // Create shadow element
  const shadow = document.createElement('div');
  shadow.className = 'timeline-item drag-shadow';
  
  // Copy styles from the original element
  shadow.style.width = `${width}px`;
  shadow.style.height = '50px';
  shadow.style.backgroundColor = colors.background;
  shadow.style.border = `2px dashed ${colors.border}`;
  shadow.style.pointerEvents = 'none';
  shadow.style.position = 'absolute';
  shadow.style.zIndex = '10';
  
  // Add content to shadow
  shadow.innerHTML = `
    <div class="item-content">
      <div class="item-name">${item.name}</div>
      <div class="item-dates">
        ${format(itemStartDate, 'MMM d')} - ${format(itemEndDate, 'MMM d, yyyy')}
      </div>
    </div>
  `;

  timeline.appendChild(shadow);
  return shadow;
}; 