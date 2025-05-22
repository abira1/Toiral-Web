import React, { useState, forwardRef } from 'react';

export interface Win95ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  role?: string;
}
export const Win95Button = forwardRef<HTMLButtonElement, Win95ButtonProps>(
  (
    {
      children,
      onClick,
      className = '',
      fullWidth = false,
      disabled = false,
      title,
      ariaLabel,
      role,
      ...rest
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Handle keyboard activation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsPressed(true);
      }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        setIsPressed(false);
        onClick?.();
      }
    };

    return (
      <button
        ref={ref}
        className={`
          ${fullWidth ? 'w-full' : ''}
          ${isPressed && !disabled ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white pt-[3px] pl-[3px]' : 'border-t-white border-l-white border-b-gray-800 border-r-gray-800'}
          relative bg-gray-300 border-2 select-none
          ${!disabled ? 'active:pt-[3px] active:pl-[3px] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white' : ''}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
          ${className}
        `}
        onClick={disabled ? undefined : onClick}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => !disabled && setIsPressed(false)}
        onMouseLeave={() => !disabled && setIsPressed(false)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsPressed(false);
        }}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel || title}
        role={role || 'button'}
        tabIndex={disabled ? -1 : 0}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

// Add display name for debugging
Win95Button.displayName = 'Win95Button';