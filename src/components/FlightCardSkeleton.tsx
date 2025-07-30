import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FlightCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <Skeleton circle height={32} width={32} />
        <div>
          <p className="font-semibold">
            <Skeleton width={60} />
          </p>
          <p className="text-sm text-gray-500">
            <Skeleton width={40} />
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <Skeleton width={20} />
          </p>
          <Skeleton width={96} height={1} />
          <p className="text-sm text-green-500">
            <Skeleton width={50} />
          </p>
        </div>
        <div>
          <p className="font-semibold">
            <Skeleton width={60} />
          </p>
          <p className="text-sm text-gray-500">
            <Skeleton width={40} />
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <p className="text-lg font-bold">
          <Skeleton width={50} />
        </p>
        <Skeleton width={80} height={36} />
      </div>
    </div>
  );
};

export default FlightCardSkeleton;
