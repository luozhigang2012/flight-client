import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BookingCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">
            <Skeleton width={150} />
          </p>
          <p className="text-lg font-bold">
            <Skeleton width={200} />
          </p>
          <p className="text-sm text-gray-600">
            <Skeleton width={100} />
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">
            <Skeleton width={80} />
          </p>
          <span className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            <Skeleton width={80} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingCardSkeleton;
