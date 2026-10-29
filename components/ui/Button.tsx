import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'onPrimary' | 'onPrimaryOutline';
type ButtonSize = 'md' | 'sm';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  /** Layout only (margins, width). Colours and shape come from the variant. */
  className?: string;
  children: React.ReactNode;
}

// One of: a route link, a URL link, or a native button. Only the native button
// can be disabled: a disabled-looking link would still navigate.
type ButtonProps = CommonProps &
  (
    | {
        /** Internal route: renders a router <Link>. */
        to: string;
        href?: never;
        target?: never;
        disabled?: never;
      }
    | {
        /** External or same-page URL: renders an <a>. */
        href: string;
        target?: '_blank';
        to?: never;
        disabled?: never;
      }
    | {
        /** Renders a native disabled <button>. */
        disabled?: boolean;
        to?: never;
        href?: never;
        target?: never;
      }
  );

// The .btn-* classes in index.css are the single source of truth for each variant.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  // For buttons on a primary-coloured band
  onPrimary: 'btn-on-primary',
  onPrimaryOutline: 'btn-on-primary-outline',
};

// sm keeps a 44px tap target.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: '',
  sm: 'px-4 py-2 text-sm min-h-11',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  target,
  onClick,
  disabled = false,
  className = '',
  children,
}) => {
  const variantClass = disabled ? 'btn-disabled' : VARIANT_CLASSES[variant];
  const classes = `${variantClass} ${SIZE_CLASSES[size]} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    const external = target === '_blank';
    return (
      <a
        href={href}
        target={target}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={classes}
      >
        {children}
        {external && (
          <>
            <Icon name="external-link" className="w-4 h-4 ml-2" />
            <span className="sr-only"> (opens in new tab)</span>
          </>
        )}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};

export default Button;
