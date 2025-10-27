import React from 'react';

export const BroadcastIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.464 9.168-6.084M13 18a3 3 0 000-6M5.436 13.683L5 15a4 4 0 006 3h1.832c4.1 0 7.625 2.464 9.168 6.084" />
  </svg>
);