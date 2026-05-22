import React from 'react';
import './KPIStats.css';

export default function KPIStats({ quotes }) {
  // Calculations
  const total = quotes.length;
  
  const active = quotes.filter(q => q.status === 'Active').length;
  
  const won = quotes.filter(q => q.status === 'Won').length;
  const lost = quotes.filter(q => q.status === 'Lost').length;
  const winRatio = total > 0 && (won + lost) > 0 
    ? Math.round((won / (won + lost)) * 100) 
    : 0;

  // Let's calculate expiring soon (e.g. within 30 days from 2025-06-01, our database seed anchor date)
  const anchorDate = new Date('2025-06-01');
  const thirtyDaysLater = new Date('2025-07-01');
  const expiringSoon = quotes.filter(q => {
    if (q.status !== 'Active') return false;
    const exp = new Date(q.expiryDate);
    return exp >= anchorDate && exp <= thirtyDaysLater;
  }).length;

  const stats = [
    {
      title: 'Total Quotes',
      value: total.toLocaleString(),
      desc: 'Centralized files indexed',
      color: 'blue',
      progressWidth: '100%',
      progressColor: 'var(--accent)',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      title: 'Active Contracts',
      value: active.toLocaleString(),
      desc: `${total > 0 ? Math.round((active / total) * 100) : 0}% of all quotes active`,
      color: 'green',
      progressWidth: `${total > 0 ? (active / total) * 100 : 0}%`,
      progressColor: 'var(--status-active)',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    },
    {
      title: 'Win Ratio',
      value: `${winRatio}%`,
      desc: `${won} won / ${lost} lost`,
      color: 'teal',
      gauge: true,
      gaugeColor: 'var(--status-won)',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      )
    },
    {
      title: 'Expiring Soon',
      value: expiringSoon.toLocaleString(),
      desc: 'Impending expiry (30 days)',
      color: 'orange',
      progressWidth: `${active > 0 ? (expiringSoon / active) * 100 : 0}%`,
      progressColor: 'var(--status-pending)',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    }
  ];

  const circleRadius = 14;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (winRatio / 100) * circumference;

  return (
    <section className="kpi-grid">
      {stats.map(s => (
        <div key={s.title} className={`kpi-card kpi-${s.color}`}>
          <div className="kpi-body">
            <div className="kpi-main-info">
              <div className="kpi-header">
                <span className="kpi-title">{s.title}</span>
                <div className="kpi-icon-wrap">{s.icon}</div>
              </div>
              <div className="kpi-value">{s.value}</div>
              <div className="kpi-desc">{s.desc}</div>
            </div>
            
            {s.gauge ? (
              <div className="kpi-gauge-wrap">
                <svg width="40" height="40" viewBox="0 0 36 36" className="kpi-svg-gauge">
                  <circle className="gauge-bg" cx="18" cy="18" r={circleRadius} fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                  <circle 
                    className="gauge-val" 
                    cx="18" 
                    cy="18" 
                    r={circleRadius} 
                    fill="transparent" 
                    stroke={s.gaugeColor} 
                    strokeWidth="3.5" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              </div>
            ) : (
              <div className="kpi-progress-wrap">
                <div className="kpi-progress-bar">
                  <div 
                    className="kpi-progress-fill" 
                    style={{ width: s.progressWidth, backgroundColor: s.progressColor }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
