import React from 'react';

interface IconTileProps {
  /** The icon (an <Icon> or inline <svg>); it inherits the tile's text colour. */
  children: React.ReactNode;
  /** Layout only (margins). */
  className?: string;
}

// DESIGN.md icon tile. Fills with primary when a `group` ancestor is hovered.
const IconTile: React.FC<IconTileProps> = ({ children, className = '' }) => (
  <div
    className={`flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light group-hover:bg-primary group-hover:text-white transition-colors duration-300 ${className}`.trim()}
  >
    {children}
  </div>
);

export default IconTile;
