import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { FlightResponseDTO } from "../api/openAPIDefinition.schemas";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";

dayjs.extend(customParseFormat);

interface FlightCardProps {
  flight: FlightResponseDTO;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { outboundFlight, selectOutboundFlight, selectReturnFlight } =
    useBooking();

  const handleSelect = () => {
    const tripType = searchParams.get("tripType");

    if (tripType === "round-trip" && !outboundFlight) {
      // 往返流程，选择去程航班
      selectOutboundFlight(flight);
      // 构造返程搜索的 URL 并跳转
      const returnSearchParams = new URLSearchParams(location.search);
      navigate(`/flights/search?${returnSearchParams.toString()}`);
    } else {
      // 单程流程，或往返流程选择返程航班
      if (tripType === "round-trip") {
        selectReturnFlight(flight);
      } else {
        selectOutboundFlight(flight);
      }

      // 检查是否登录，然后跳转到确认页
      if (isAuthenticated) {
        navigate(`/booking/review`);
      } else {
        navigate(`/login`, { state: { from: `/booking/review` } });
      }
    }
  };

  const getAirlineLogo = (flightNumber: string) => {
    const airlineCode = flightNumber.substring(0, 2);
    return `https://ui-avatars.com/api/?name=${airlineCode}&background=random&color=fff&size=32`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <img
          src={getAirlineLogo(flight.flightNumber ?? "AV")}
          alt="Airline logo"
          className="h-8 w-8 rounded-full"
        />
        <div>
          <p className="font-semibold">
            {dayjs(flight.departureTime, "HH:mm:ss").format("h:mm A")}
          </p>
          <p className="text-sm text-gray-500">
            {dayjs(flight.departureDate).format("MMM D")}
          </p>
          <p className="text-sm text-gray-500">{flight.departure}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">3h</p>
          <div className="w-24 h-px bg-gray-300"></div>
          <p className="text-sm text-green-500">Non-stop</p>
        </div>
        <div>
          <p className="font-semibold">
            {dayjs(flight.departureTime, "HH:mm:ss")
              .add(3, "hour")
              .format("h:mm A")}
          </p>
          <p className="text-sm text-gray-500">
            {dayjs(flight.departureDate).add(3, "hour").format("MMM D")}
          </p>
          <p className="text-sm text-gray-500">{flight.destination}</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <p className="text-lg font-bold">${flight.price}</p>
        <button
          onClick={handleSelect}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
