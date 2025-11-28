import React from 'react';

interface LogoProps {
  className?: string;
  // If true, removes the text curve for smaller icon-only usage
  simple?: boolean; 
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full", simple = false }) => {
  return (
    <svg 
      viewBox="0 0 300 300" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      aria-label="CVOCA Logo"
    >
      <defs>
        <linearGradient id="birdGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" className="text-primary" stopColor="currentColor" />
          <stop offset="100%" className="text-secondary" stopColor="currentColor" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main "C" Ring Structure - Uses currentColor for parent control */}
      <path 
        d="M 235 90 A 105 105 0 1 0 235 210" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="24" 
        strokeLinecap="round"
        className="transition-colors duration-300"
      />

      {/* Stylized Bird / Flight Symbol */}
      <g transform="translate(10, 10)">
         {/* Main Wing Body */}
         <path 
           d="M 70 170 Q 130 240 230 70 L 210 60 Q 120 200 85 155 Z" 
           className="fill-primary dark:fill-primary-light transition-colors duration-300" 
           style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
         />
         {/* Accent Swoosh */}
         <path 
           d="M 130 170 Q 160 190 220 110" 
           fill="none"
           stroke="currentColor"
           strokeWidth="14"
           strokeLinecap="round"
           className="text-secondary dark:text-secondary-light transition-colors duration-300"
         />
      </g>

      {/* Motto Text: Professional Excellence */}
      {!simple && (
        <>
          <path id="textCurvePath" d="M 55, 235 A 130, 130 0 0, 0 245, 235" fill="none" />
          <text className="text-[19px] font-bold uppercase tracking-[0.2em] fill-current transition-colors duration-300">
            <textPath href="#textCurvePath" startOffset="50%" textAnchor="middle">
              Professional Excellence
            </textPath>
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;