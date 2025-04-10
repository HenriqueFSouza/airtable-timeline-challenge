# Timeline Visualization Component

A React component for visualizing items on a timeline with drag-and-drop, resizing, and editing capabilities.

## Features

- Horizontal timeline with date ticks on top
- Timeline items that span a date range
- Automatic lane assignment to minimize vertical space usage
- Zooming in and out of the timeline
- Drag and drop to reposition items (updating start/end date)
- Resize handles to adjust item duration
- Inline name editing
- Create new items by clicking on empty space

## Running the Project

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open your browser at http://localhost:3000

## Implementation Details

### What I Like About the Implementation

- Clean, modular component architecture separating the timeline, timeline items, and axis
- Efficient lane assignment algorithm that minimizes the number of lanes
- Smooth drag-and-drop and resize interactions
- Responsive design that adapts to different screen sizes
- Intuitive zooming feature that maintains visual context

### What I Would Change With More Time

- Add more customization options for colors, sizes, and styling
- Implement keyboard navigation for accessibility
- Add undo/redo functionality for item changes
- Allow for more complex item visualization with additional metadata
- Optimize performance for large numbers of items
- Add animation for smoother transitions

### Design Decisions

The timeline design was inspired by the example provided in the assignment instructions and Google Calendar. Key design decisions include:

1. **Lane-based Layout**: Items are arranged in horizontal lanes to efficiently use vertical space.
2. **Drag-and-Drop Interaction**: Intuitive way to reschedule items by moving them on the timeline.
3. **Resize Handles**: Allow precise adjustments to item durations.
4. **Automatic Date Ticks**: The timeline automatically adjusts the date tick density based on zoom level.
5. **Month Headers**: Visual cues to help identify the month at any position.

### Testing Strategy

If I had more time, I would implement the following tests:

1. **Unit Tests**:

   - Test lane assignment algorithm with various item configurations
   - Test date calculations and formatting
   - Test component state management

2. **End-to-End Tests**:

   - Test drag-and-drop functionality
   - Test resize functionality
   - Test item creation and editing

3. **Performance Tests**:
   - Test with large numbers of items
   - Test rendering and interaction performance

## Technologies Used

- React for UI components
- date-fns for date manipulation
- CSS for styling
- Vite for development and building
