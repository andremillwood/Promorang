interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  count?: number;
}

export default function SkeletonLoader({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonLoaderProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-lg';
    }
  };

  const skeletonElement = (
    <div
      className={`bg-gray-200 animate-pulse ${getVariantClasses()} ${className}`}
      style={{ 
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '120px')
      }}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{skeletonElement}</div>
      ))}
    </div>
  );
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <SkeletonLoader variant="circular" width="40px" height="40px" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader variant="text" width="120px" />
          <SkeletonLoader variant="text" width="80px" />
        </div>
      </div>
      <SkeletonLoader variant="rectangular" height="200px" className="mb-4" />
      <SkeletonLoader variant="text" count={3} />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-4">
      <SkeletonLoader variant="circular" width="48px" height="48px" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader variant="text" width="60%" />
        <SkeletonLoader variant="text" width="40%" />
      </div>
      <SkeletonLoader variant="rectangular" width="80px" height="32px" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }, (_, index) => (
        <td key={index} className="px-6 py-4">
          <SkeletonLoader variant="text" />
        </td>
      ))}
    </tr>
  );
}
