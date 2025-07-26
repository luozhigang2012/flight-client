import type { FlightResponseDTO } from "@/api/openAPIDefinition.schemas";
import { Link } from "react-router-dom";

interface FlightCardProps {
  flight: FlightResponseDTO;
}

function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-lg font-bold">{flight.flightNumber}</div>
          <div className="text-sm text-gray-600">
            {flight.departure} {" > "} {flight.destination}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">¥{flight.price}</div>
          <Link
            to={`/flight/${flight.id}`}
            className="text-blue-500 hover:underline"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FlightCard;
