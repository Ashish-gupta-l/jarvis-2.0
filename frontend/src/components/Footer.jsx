import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="#15803d" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>CareTrail Platform</span>
          <span className="greenery-pill">🍃 Greenery Edition</span>
          <span>— Intelligent Healthcare Continuity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
          <Info size={14} />
          <span>Notice: Student project prototype. Demonstrates evidence-based verification, gap mapping, and secure sharing. Synthetic data only.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
