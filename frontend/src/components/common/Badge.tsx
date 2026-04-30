import React from 'react';

interface BadgeProps {
  label: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
}

const colorMap = {
  blue: { bg: '#EFF6FF', text: '#1D4ED8' },
  green: { bg: '#F0FDF4', text: '#15803D' },
  orange: { bg: '#FFF7ED', text: '#C2410C' },
  red: { bg: '#FEF2F2', text: '#B91C1C' },
  gray: { bg: '#F3F4F6', text: '#374151' },
};

const Badge: React.FC<BadgeProps> = ({ label, color = 'blue' }) => {
  const { bg, text } = colorMap[color];
  return (
    <span style={{
      background: bg,
      color: text,
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      display: 'inline-block',
    }}>
      {label}
    </span>
  );
};

export default Badge;
