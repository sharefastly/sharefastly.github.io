// Progress Bar component

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-[#1A3D64]">Uploading...</span>
          <span className="text-[#1A3D64]">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner border border-[#1A3D64]/20">
        <div
          className="h-full bg-[#1D546C] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
