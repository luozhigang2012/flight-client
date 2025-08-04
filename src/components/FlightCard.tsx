import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { FlightResponseDTO } from "../api/openAPIDefinition.schemas";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { useModal } from "../context/ModalContext";
import FlightDetailView from "./FlightDetailView";
import { useTranslation } from "react-i18next";

dayjs.extend(customParseFormat);

interface FlightCardProps {
  flight: FlightResponseDTO;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { outboundFlight, selectOutboundFlight, selectReturnFlight } =
    useBooking();
  const { showLoginModal } = useModal();

  const handleSelect = () => {
    const tripType = searchParams.get("tripType");

    // 场景1: 选择去程航班 (往返)
    if (tripType === "round-trip" && !outboundFlight) {
      selectOutboundFlight(flight);
      // 构造返程航班的搜索链接，直接复用现有参数。
      // SearchResultPage.tsx 会根据上下文自动处理出发地/目的地的交换逻辑。
      const returnSearchParams = new URLSearchParams(searchParams);
      navigate(`/flights/search?${returnSearchParams.toString()}`);
    } else {
      // 场景2: 选择返程航班或单程航班
      const proceedToBooking = () => {
        if (tripType === "round-trip") {
          selectReturnFlight(flight);
        } else {
          selectOutboundFlight(flight);
        }
        navigate(`/booking/review`);
      };

      if (isAuthenticated) {
        proceedToBooking();
      } else {
        showLoginModal(proceedToBooking);
      }
    }
  };

  const getAirlineLogo = (flightNumber: string) => {
    const airlineCode = flightNumber.substring(0, 2);
    return `https://ui-avatars.com/api/?name=${airlineCode}&background=random&color=fff&size=32`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
            <p className="text-sm text-gray-500">{flight.destination}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-lg font-bold">${flight.price}</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            {isExpanded ? "Hide Details" : "Show Details"}
          </button>
          <button
            onClick={handleSelect}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            {t("Select")}
          </button>
        </div>
      </div>
      {isExpanded && (
        <FlightDetailView
          flightId={flight.id!}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default FlightCard;
