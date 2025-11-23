import React, { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

const HeatMapProfile = ({ repos = [] }) => {
  // 1. Extract creation dates and aggregate counts (e.g., 2 repos on same day = count 2)
  const activityData = useMemo(() => {
    const counts = {};
    
    repos.forEach((repo) => {
      if (repo.createdAt) {
        const date = repo.createdAt.split("T")[0]; // Extract YYYY-MM-DD
        counts[date] = (counts[date] || 0) + 1;
      }
    });

    // Convert object back to array format expected by HeatMap
    return Object.entries(counts).map(([date, count]) => ({
      date,
      count,
    }));
  }, [repos]);

  // 2. Define colors for activity levels (GitHub style)
  const panelColors = {
    0: "#161b22", // Empty (Dark background)
    2: "#0e4429", // Low activity
    4: "#006d32", // Medium activity
    10: "#26a641", // High activity
    20: "#39d353", // Very High activity
  };

  return (
    <div style={{ width: "100%" }}>
      <h4 style={{ marginBottom: "10px" }}>Recent Contributions</h4>
      <HeatMap
        value={activityData}
        width={800} 
        style={{ color: "#adbac7" }} 
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} // Last 1 year
        panelColors={panelColors}
        rectSize={14}
        space={4}
        rectProps={{
          rx: 2.5, // Rounded corners
        }}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]} // Added week labels
      />
    </div>
  );
};

export default HeatMapProfile;