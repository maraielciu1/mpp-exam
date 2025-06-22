import React from 'react';
import './PartyChart.css';

const PartyChart = ({ partyStats: propPartyStats }) => {
  // Use prop if provided, otherwise use empty object
  const partyStats = propPartyStats || {};
  
  const colors = {
    'Democratic Party': '#1e88e5',
    'Republican Party': '#e53935',
    'Independent': '#ff9800',
    'Green Party': '#4caf50',
    'Libertarian Party': '#9c27b0'
  };

  // Safely get values and handle undefined/null
  const values = Object.values(partyStats || {});
  const totalCandidates = values.reduce((sum, count) => sum + (count || 0), 0);
  
  if (totalCandidates === 0) {
    return (
      <div className="party-chart">
        <h3>Party Distribution</h3>
        <div className="no-data">No candidates to display</div>
      </div>
    );
  }

  let currentAngle = 0;
  const segments = [];

  Object.entries(partyStats || {}).forEach(([party, count]) => {
    if (count > 0) {
      const percentage = (count / totalCandidates) * 100;
      const angle = (percentage / 100) * 360;
      
      segments.push({
        party,
        count,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: colors[party] || '#ccc'
      });
      
      currentAngle += angle;
    }
  });

  return (
    <div className="party-chart">
      <h3>Party Distribution</h3>
      <div className="chart-container">
        <svg className="pie-chart" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#f0f0f0" strokeWidth="40" />
          
          {segments.map((segment, index) => {
            const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (segment.endAngle - 90) * (Math.PI / 180);
            
            const x1 = 100 + 80 * Math.cos(startAngleRad);
            const y1 = 100 + 80 * Math.sin(startAngleRad);
            const x2 = 100 + 80 * Math.cos(endAngleRad);
            const y2 = 100 + 80 * Math.sin(endAngleRad);
            
            const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'L 100 100',
              'Z'
            ].join(' ');
            
            return (
              <path
                key={index}
                d={pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div className="chart-legend">
          {segments.map((segment, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="legend-text">
                <span className="legend-party">{segment.party}</span>
                <span className="legend-count">
                  {segment.count} ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="total-candidates">
          Total Candidates: <strong>{totalCandidates}</strong>
        </div>
      </div>
    </div>
  );
};

export default PartyChart; 