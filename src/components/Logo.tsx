import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", showTagline = false }) => {
  return (
    <div className="flex flex-col items-center">
      <img 
        src="https://hstvjoslywhedvmbgxcm.supabase.co/storage/v1/object/public/qrcode//c-square-logo-.png"
        alt="C Square Cafe"
        className={className}
      />
      {showTagline && (
        <p className="mt-2 text-sm font-medium tracking-wider text-brown-900">
          TASTE FEEL REPEAT
        </p>
      )}
    </div>
  );
};