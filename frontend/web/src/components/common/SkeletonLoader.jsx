import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      {/* Status Selector Skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Meal Cards Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3 mb-6">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
