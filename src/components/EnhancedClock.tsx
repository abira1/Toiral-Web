import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
export function EnhancedClock() {
  const {
    settings
  } = useTheme();
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      const localTime = new Date(new Date().toLocaleString('en-US', {
        timeZone: settings.clockTimezone
      }));
      setTime(localTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.clockTimezone]);
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  return <div className="w-full px-4 flex flex-col items-center justify-center">
      {/* Digital Clock */}
      <div className="mb-4 text-center">
        <div className="relative">
          <div className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white tracking-wider tabular-nums opacity-90" style={{
          filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.7))',
          WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.3)',
          fontFamily: "'DSEG7 Classic', monospace"
        }}>
            {`${hours}:${minutes}:${seconds}`}
          </div>
          <div className="text-white/80 font-mono text-center mt-1 text-xs sm:text-sm tracking-wide">
            {time.toLocaleString('en-US', {
            timeZone: settings.clockTimezone,
            timeZoneName: 'short'
          })}
          </div>
        </div>
      </div>
      {/* Logo */}
      <div className="transform hover:scale-105 transition-transform duration-300">
        <img src="/toiral.png" alt="Toiral Logo" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
      </div>
      <style>
        {`
          @font-face {
            font-family: 'DSEG7 Classic';
            src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Regular.woff2') format('woff2');
          }
        `}
      </style>
    </div>;
}