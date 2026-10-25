import React from 'react';

type CardPadding = 'none' | 'md' | 'lg' | 'xl';

interface CardProps {
  as?: 'div' | 'article' | 'section' | 'li';
  /** DESIGN.md spacing: md = 1rem, lg = 1.5rem (default), xl = 2rem. */
  padding?: CardPadding;
  /** shadow-xl instead of shadow-lg, for emphasised cards (e.g. stats). */
  emphasis?: boolean;
  /** Hover lift. Only for cards where the whole card is clickable. */
  interactive?: boolean;
  /** Layout only (grid, flex, height, animation). */
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const Card: React.FC<CardProps> = ({
  as: Tag = 'div',
  padding = 'lg',
  emphasis = false,
  interactive = false,
  className = '',
  style,
  children,
}) => {
  const classes = [
    'bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-700',
    emphasis ? 'shadow-xl' : 'shadow-lg',
    interactive && 'transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30',
    PADDING_CLASSES[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} style={style}>
      {children}
    </Tag>
  );
};

export default Card;
