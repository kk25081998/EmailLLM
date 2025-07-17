import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  variant = 'spinner',
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  if (variant === 'skeleton') {
    return <SkeletonLoader size={size} className={className} />;
  }

  if (variant === 'dots') {
    return <DotsLoader size={size} text={text} showText={showText} className={className} />;
  }

  if (variant === 'pulse') {
    return <PulseLoader size={size} text={text} showText={showText} className={className} />;
  }

  // Default spinner variant
  return (
    <div className={`loading-spinner ${sizeClass} ${className}`}>
      <div className="loading-spinner__circle">
        <div className="loading-spinner__inner"></div>
      </div>
      {showText && text && (
        <span className="loading-spinner__text">{text}</span>
      )}
    </div>
  );
};

// Skeleton loader for content placeholders
const SkeletonLoader = ({ size, className }) => {
  const skeletonClass = `skeleton-loader skeleton-loader--${size}`;
  
  return (
    <div className={`${skeletonClass} ${className}`}>
      <div className="skeleton-loader__line skeleton-loader__line--title"></div>
      <div className="skeleton-loader__line skeleton-loader__line--subtitle"></div>
      <div className="skeleton-loader__line skeleton-loader__line--content"></div>
      <div className="skeleton-loader__line skeleton-loader__line--content skeleton-loader__line--short"></div>
    </div>
  );
};

// Dots loader for subtle loading states
const DotsLoader = ({ size, text, showText, className }) => {
  const sizeClass = `dots-loader--${size}`;
  
  return (
    <div className={`dots-loader ${sizeClass} ${className}`}>
      <div className="dots-loader__container">
        <div className="dots-loader__dot"></div>
        <div className="dots-loader__dot"></div>
        <div className="dots-loader__dot"></div>
      </div>
      {showText && text && (
        <span className="dots-loader__text">{text}</span>
      )}
    </div>
  );
};

// Pulse loader for button loading states
const PulseLoader = ({ size, text, showText, className }) => {
  const sizeClass = `pulse-loader--${size}`;
  
  return (
    <div className={`pulse-loader ${sizeClass} ${className}`}>
      <div className="pulse-loader__circle"></div>
      {showText && text && (
        <span className="pulse-loader__text">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner; 