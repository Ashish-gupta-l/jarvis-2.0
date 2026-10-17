import React from 'react';

// Pokemon Forest Ambient Nature Spores & Floating Leaves
export const PokemonForestAmbient = () => {
  const particles = [
    { id: 1, symbol: '🍃', left: '5%', delay: '0s', duration: '18s', size: '1.2rem', opacity: 0.35 },
    { id: 2, symbol: '✨', left: '15%', delay: '4s', duration: '14s', size: '0.9rem', opacity: 0.4 },
    { id: 3, symbol: '🌱', left: '25%', delay: '8s', duration: '22s', size: '1.1rem', opacity: 0.3 },
    { id: 4, symbol: '🍃', left: '38%', delay: '2s', duration: '16s', size: '1.3rem', opacity: 0.35 },
    { id: 5, symbol: '✨', left: '48%', delay: '6s', duration: '19s', size: '0.85rem', opacity: 0.45 },
    { id: 6, symbol: '🌿', left: '58%', delay: '11s', duration: '21s', size: '1.15rem', opacity: 0.3 },
    { id: 7, symbol: '🍃', left: '68%', delay: '3s', duration: '17s', size: '1.25rem', opacity: 0.35 },
    { id: 8, symbol: '✨', left: '78%', delay: '7s', duration: '15s', size: '0.9rem', opacity: 0.4 },
    { id: 9, symbol: '🌱', left: '88%', delay: '1s', duration: '20s', size: '1.1rem', opacity: 0.3 },
    { id: 10, symbol: '🍃', left: '94%', delay: '9s', duration: '18s', size: '1.3rem', opacity: 0.35 },
  ];

  return (
    <div className="pokemon-forest-ambient" aria-hidden="true">
      {/* Decorative Forest Silhouette Top Banner */}
      <div className="forest-canopy-treeline" />
      
      {/* Drifting Leaves and Magical Forest Spores */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="forest-floating-leaf"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            opacity: p.opacity,
          }}
        >
          {p.symbol}
        </span>
      ))}
      
      {/* Bottom Forest Moss Silhouette */}
      <div className="forest-ground-moss" />
    </div>
  );
};

export default PokemonForestAmbient;
