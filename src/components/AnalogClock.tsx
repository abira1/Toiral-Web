import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalogClockProps {
  size?: number;
  showSeconds?: boolean;
  className?: string;
}

export function AnalogClock({ size = 200, showSeconds = true, className = '' }: AnalogClockProps) {
  const { settings } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const localTime = new Date(new Date().toLocaleString('en-US', {
        timeZone: settings.clockTimezone || 'UTC'
      }));
      setTime(localTime);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [settings.clockTimezone]);

  // Calculate clock hand angles
  const secondsAngle = (time.getSeconds() / 60) * 360;
  const minutesAngle = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursAngle = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  const center = size / 2;
  const strokeWidth = size / 40;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Clock face */}
        <circle 
          cx={center} 
          cy={center} 
          r={center - strokeWidth} 
          fill="white" 
          stroke="#888" 
          strokeWidth={strokeWidth} 
        />
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 360;
          const radian = (angle - 90) * (Math.PI / 180);
          const outerRadius = center - strokeWidth * 2;
          const innerRadius = outerRadius - size / 15;
          
          const x1 = center + outerRadius * Math.cos(radian);
          const y1 = center + outerRadius * Math.sin(radian);
          const x2 = center + innerRadius * Math.cos(radian);
          const y2 = center + innerRadius * Math.sin(radian);
          
          return (
            <line 
              key={i} 
              x1={x1} 
              y1={y1} 
              x2={x2} 
              y2={y2} 
              stroke="#333" 
              strokeWidth={strokeWidth / 1.5} 
              strokeLinecap="round" 
            />
          );
        })}
        
        {/* Hour hand */}
        <line 
          x1={center} 
          y1={center} 
          x2={center + (center * 0.5) * Math.cos((hoursAngle - 90) * (Math.PI / 180))} 
          y2={center + (center * 0.5) * Math.sin((hoursAngle - 90) * (Math.PI / 180))} 
          stroke="#333" 
          strokeWidth={strokeWidth * 1.5} 
          strokeLinecap="round" 
        />
        
        {/* Minute hand */}
        <line 
          x1={center} 
          y1={center} 
          x2={center + (center * 0.7) * Math.cos((minutesAngle - 90) * (Math.PI / 180))} 
          y2={center + (center * 0.7) * Math.sin((minutesAngle - 90) * (Math.PI / 180))} 
          stroke="#555" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
        />
        
        {/* Second hand */}
        {showSeconds && (
          <line 
            x1={center} 
            y1={center} 
            x2={center + (center * 0.8) * Math.cos((secondsAngle - 90) * (Math.PI / 180))} 
            y2={center + (center * 0.8) * Math.sin((secondsAngle - 90) * (Math.PI / 180))} 
            stroke="#d00" 
            strokeWidth={strokeWidth / 2} 
            strokeLinecap="round" 
          />
        )}
        
        {/* Center dot */}
        <circle 
          cx={center} 
          cy={center} 
          r={strokeWidth * 1.5} 
          fill="#333" 
        />
      </svg>
      
      {/* Timezone display */}
      <div className="text-xs text-center mt-2 font-mono">
        {time.toLocaleString('en-US', {
          timeZone: settings.clockTimezone || 'UTC',
          timeZoneName: 'short'
        })}
      </div>
    </div>
  );
}