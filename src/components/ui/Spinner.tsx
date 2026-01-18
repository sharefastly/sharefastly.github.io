// Spinner / Loading component

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`
        animate-spin rounded-full
        border-[#0C2B4E] border-t-transparent
        ${sizeClasses[size]}
        ${className}
      `}
    />
  );
}

// Full page spinner with backdrop
export function PageSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F4F4F4] z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#F4F4F4] border-t-[#0C2B4E] animate-spin" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-r-[#1D546C] animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        <p className="text-[#1A3D64] font-medium text-lg">{message}</p>
      </div>
    </div>
  );
}

// Overlay spinner for API calls (shows over content)
export function OverlaySpinner({ message = 'Please wait...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0C2B4E]/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-[#F4F4F4] border-t-[#0C2B4E] animate-spin" />
        </div>
        <p className="text-[#0C2B4E] font-medium">{message}</p>
      </div>
    </div>
  );
}

// Inline spinner for buttons and small areas
export function InlineSpinner() {
  return (
    <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}
