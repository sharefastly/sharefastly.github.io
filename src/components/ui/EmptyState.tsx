// Empty State component

import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && (
        <div className="text-6xl mb-4 text-[#1D546C]">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[#0C2B4E] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[#1A3D64] text-center max-w-md mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
