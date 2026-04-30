import React from 'react';

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? '#F59E0B' : '#D1D5DB', fontSize: size }}>
          ★
        </span>
      ))}
      <span style={{ fontSize: size - 2, color: '#6B7280', marginLeft: 4 }}>
        {rating > 0 ? rating.toFixed(1) : 'N/A'}
      </span>
    </span>
  );
};

export default StarRating;
