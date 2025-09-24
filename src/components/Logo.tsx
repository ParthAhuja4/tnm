import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'default' | 'small' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'default', ...props }) => {
  const size = {
    small: 'h-8 w-8',
    default: 'h-10 w-10',
    large: 'h-16 w-16',
  }[variant];

  return (
    <svg
      className={cn(size, className)}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="40" height="40" rx="8" fill="#4F46E5" />
      <path
        d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM16 24V16L24 20L16 24Z"
        fill="white"
      />
    </svg>
  );
};
