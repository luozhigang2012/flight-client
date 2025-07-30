import React, { useMemo, useState } from "react";
import { useGetBookings } from "../api/booking-controller/booking-controller";
import { useGetFlightDetail } from "../api/flight-controller/flight-controller";
import type {
  BookingResponseDTO,
  PagedResponseDTOBookingResponseDTO,
} from "../api/openAPIDefinition.schemas";
import dayjs from "dayjs";
import FlightDetailView from "../components/FlightDetailView";

const BookingCard: React.FC<{ booking: BookingResponseDTO }> = ({
  booking,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: flightResponse, isLoading: isLoadingFlight } =
    useGetFlightDetail(booking.flightId!, {
      query: { enabled: isExpanded }, // 只有在展开时才获取航班详情
    });
  const flight = flightResponse?.data;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div
        className="p-4 flex justify-between items-start cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <p className="text-sm text-gray-500">
            Booking Reference: {booking.reference}
          </p>
          {isLoadingFlight ? (
            <p>Loading flight details...</p>
          ) : flight ? (
            <p className="text-lg font-bold">
              {flight.departure} → {flight.destination}
            </p>
          ) : null}
          <p className="text-sm text-gray-600">
            Booked on:{" "}
            {dayjs(booking.bookingTime).format("YYYY-MM-DD HH:mm:ss")}
          </p>
        </div>
        <div className="text-right">
          <p
            className={`font-bold ${
              booking.status === "CONFIRMED"
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {booking.status}
          </p>
          <span className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            {isExpanded ? "Hide Details" : "Show Details"}
          </span>
        </div>
      </div>
      {isExpanded && (
        <div>
          <FlightDetailView
            flightId={booking.flightId!}
            onClose={() => setIsExpanded(false)}
          />
          <div className="p-4 border-t border-gray-200">
            <h4 className="font-semibold mb-2">Passengers</h4>
            <ul className="list-disc list-inside">
              {booking.passengers?.map((passenger, index) => (
                <li key={index}>
                  {passenger.firstName} {passenger.lastName} ({passenger.email})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const MyBookingsPage: React.FC = () => {
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");
  const { data: bookingsResponse, isLoading } = useGetBookings({
    status: status.toUpperCase(),
  });

  const bookings = useMemo(() => {
    const pagedData = bookingsResponse?.data as
      | PagedResponseDTOBookingResponseDTO
      | undefined;
    if (pagedData?.content) {
      return pagedData.content as BookingResponseDTO[];
    }
    return [];
  }, [bookingsResponse]);

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>

      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setStatus("upcoming")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              status === "upcoming"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatus("past")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              status === "past"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Past
          </button>
        </nav>
      </div>

      {isLoading ? (
        <p>Loading bookings...</p>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">
            No {status} bookings
          </h3>
          <p className="text-gray-500 mt-2">
            You don't have any {status} bookings yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
