import React from "react";
import { useTranslation } from "react-i18next";
import { useGetFlightDetail } from "../api/flight-controller/flight-controller";
import dayjs from "dayjs";

interface FlightDetailViewProps {
  flightId: number;
  onClose: () => void;
}

const FlightDetailView: React.FC<FlightDetailViewProps> = ({
  flightId,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data: flightResponse, isLoading } = useGetFlightDetail(flightId);
  const flight = flightResponse?.data;

  if (isLoading) {
    return <div className="p-4 text-center">Loading flight details...</div>;
  }

  if (!flight) {
    return (
      <div className="p-4 text-center text-red-500">
        Could not load flight details.
      </div>
    );
  }

  return (
    <div
      className="p-6 bg-gray-50 border-t border-gray-200 cursor-pointer"
      onClick={onClose}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <p className="text-sm text-gray-500">{t("From")}</p>
          <p className="text-xl font-bold">{flight.departure}</p>
          <p className="text-gray-600">
            {dayjs(flight.departureDate).format("dddd, MMMM D, YYYY")}
          </p>
          <p className="text-lg text-gray-800">
            {dayjs(flight.departureTime, "HH:mm:ss").format("h:mm A")}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">3h flight</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">{t("To")}</p>
          <p className="text-xl font-bold">{flight.destination}</p>
          <p className="text-gray-600">
            {dayjs(flight.departureDate)
              .add(3, "hour")
              .format("dddd, MMMM D, YYYY")}
          </p>
          <p className="text-lg text-gray-800">
            {dayjs(flight.departureTime, "HH:mm:ss")
              .add(3, "hour")
              .format("h:mm A")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailView;
