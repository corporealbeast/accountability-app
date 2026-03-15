import React from 'react';

export default function Home() {
  return (
    <div style={{ backgroundColor: '#2C2F33', color: '#B0E0E6', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Accountability Dashboard</h1>
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
        <div style={{ borderRight: '1px solid #B0E0E6', paddingRight: '20px' }}>
          <h3>GYMS</h3>
          <ul>
            <li>House of Power</li>
            <li>Strength Collective</li>
            <li>PowerSource</li>
          </ul>
          <h3 style={{ marginTop: '20px' }}>PROJECTS</h3>
          <ul>
            <li>New Jobs/Ideas</li>
            <li>GrayRevenue</li>
          </ul>
        </div>
        <div>
          <h2>Active Strongman Prep</h2>
          <p>Targeting: California's Strongest Man - March 28</p>
          <div style={{ border: '2px solid #B0E0E6', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <p>Weight: 260-270 lbs</p>
            <p>Status: Monitoring Adductor/Gracilis Strain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
