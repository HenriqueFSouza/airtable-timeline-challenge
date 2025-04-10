/**
 * Assigns timeline items to lanes to avoid overlapping events
 * @returns Array of arrays representing lanes with their items
 */
export default function assignLanes(items) {
  const sortedItems = items.sort((a, b) =>
      new Date(a.start) - new Date(b.start)
  );
  const lanes = [];

  function assignItemToLane(item) {
      for (const lane of lanes) {
          if (new Date(lane[lane.length - 1].end) < new Date(item.start)) {
              lane.push(item);
              return;
          }
      }
      lanes.push([item]);
  }

  for (const item of sortedItems) {
      assignItemToLane(item);
  }
  return lanes;
}
