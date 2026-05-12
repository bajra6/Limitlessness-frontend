import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatTime, formatDate, calculateAgeStats } from '../utils';

export default function AgeMatrix() {
  const birthDate = "2002-05-15T00:00:00";
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState(calculateAgeStats(birthDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setStats(calculateAgeStats(birthDate));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const data = [
    { name: 'Lived', value: stats.progressPercentage, fill: '#818cf8' },
    { name: 'Remaining', value: 100 - stats.progressPercentage, fill: '#3f3f46' }
  ];

  // Calculate weeks, days, hours, minutes, seconds remaining
  const remainingDays = stats.remainingDays;
  const weeks = Math.floor(remainingDays / 7);
  const days = remainingDays % 7;
  
  const remainingSeconds = stats.remainingSeconds;
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="glass-tile p-6 flex flex-col h-full">
      {/* Main Pie Chart Section */}
      <div className="flex-1 flex items-center justify-center mb-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={130}
              paddingAngle={2}
              dataKey="value"
              animationDuration={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Stats Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="space-y-1">
              <div className="mono-text text-xs text-zinc-400 uppercase tracking-widest mb-2">
                Until 80
              </div>
              <div className="flex gap-4 justify-center items-baseline">
                <div>
                  <div className="mono-text text-lg font-bold text-indigo-300 leading-none">
                    {weeks}
                  </div>
                  <div className="mono-text text-xs text-zinc-500 mt-1">wks</div>
                </div>
                <div>
                  <div className="mono-text text-lg font-bold text-white leading-none">
                    {days}
                  </div>
                  <div className="mono-text text-xs text-zinc-500 mt-1">d</div>
                </div>
              </div>
              <div className="flex gap-3 justify-center items-baseline mt-3 text-xs">
                <div>
                  <div className="mono-text font-semibold text-indigo-200 leading-none">
                    {String(hours).padStart(2, '0')}
                  </div>
                  <div className="mono-text text-zinc-600 text-[10px] mt-0.5">h</div>
                </div>
                <div className="text-zinc-600">:</div>
                <div>
                  <div className="mono-text font-semibold text-indigo-200 leading-none">
                    {String(minutes).padStart(2, '0')}
                  </div>
                  <div className="mono-text text-zinc-600 text-[10px] mt-0.5">m</div>
                </div>
                <div className="text-zinc-600">:</div>
                <div>
                  <div className="mono-text font-semibold text-indigo-200 leading-none animate-pulse">
                    {String(seconds).padStart(2, '0')}
                  </div>
                  <div className="mono-text text-zinc-600 text-[10px] mt-0.5">s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Date & Time - Center Spanning */}
      <div className="flex-shrink-0 text-center border-t border-white/10 pt-4">
        <p className="mono-text text-xs text-zinc-400 mb-2">Today</p>
        <p className="mono-text text-base text-indigo-300 font-semibold">
          {formatDate(time)} • {formatTime(time)}
        </p>
      </div>
    </div>
  );
}
