import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  animate?: boolean;
}

const Skeleton = ({ 
  className = '', 
  width, 
  height, 
  circle = false, 
  count = 1, 
  animate = true 
}: SkeletonProps) => {
  
  const baseStyle: React.CSSProperties = {
    display: 'block',
    backgroundColor: '#e2e8f0', // Light gray background
    borderRadius: circle ? '50%' : '0.25rem',
    width: width || '100%',
    height: height,
    ...(!animate && { animation: 'none' }),
  };

  // Generate multiple skeleton items if count > 1
  const items = Array(count).fill(0).map((_, index) => (
    <span
      key={index}
      className={`skeleton-pulse ${className}`}
      style={{
        ...baseStyle,
        marginBottom: index < count - 1 ? '0.5rem' : 0,
      }}
      aria-hidden="true"
    />
  ));

  return <>{items}</>;
};

// Card skeleton for meeting items
export const MeetingCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-full">
      <div className="p-4">
        <Skeleton height={24} className="mb-3" />
        <Skeleton height={16} count={2} />
        
        <div className="flex items-center mt-4">
          <Skeleton width={40} height={40} circle />
          <div className="ml-3 flex-1">
            <Skeleton height={14} width="60%" />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <Skeleton height={16} width="40%" />
        <Skeleton height={30} width={100} />
      </div>
    </div>
  );
};

// Meeting details skeleton
export const MeetingDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <Skeleton height={32} className="mb-4" />
        <Skeleton height={18} count={3} className="mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Skeleton height={16} width="40%" className="mb-2" />
            <Skeleton height={24} width="70%" />
          </div>
          <div>
            <Skeleton height={16} width="40%" className="mb-2" />
            <Skeleton height={24} width="70%" />
          </div>
          <div>
            <Skeleton height={16} width="40%" className="mb-2" />
            <Skeleton height={24} width="70%" />
          </div>
          <div>
            <Skeleton height={16} width="40%" className="mb-2" />
            <Skeleton height={24} width="70%" />
          </div>
        </div>
        
        <Skeleton height={16} width="30%" className="mb-2" />
        <Skeleton height={100} className="mb-6" />
        
        <div className="flex justify-end">
          <Skeleton height={40} width={120} />
        </div>
      </div>
    </div>
  );
};

// Form skeleton
export const FormSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <Skeleton height={32} className="mb-6" />
      
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="mb-4">
          <Skeleton height={16} width="30%" className="mb-2" />
          <Skeleton height={40} />
        </div>
      ))}
      
      <div className="mt-6">
        <Skeleton height={48} width="100%" />
      </div>
    </div>
  );
};

export default Skeleton;
