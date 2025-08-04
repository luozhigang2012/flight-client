import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getBookings } from "../api/booking-controller/booking-controller";
import { useGetFlightDetail } from "../api/flight-controller/flight-controller";
import type { BookingResponseDTO } from "../api/openAPIDefinition.schemas";
import dayjs from "dayjs";
import FlightDetailView from "../components/FlightDetailView";
import BookingCardSkeleton from "../components/BookingCardSkeleton";

const BookingCard: React.FC<{ booking: BookingResponseDTO }> = ({
  booking,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: flightResponse, isLoading: isLoadingFlight } =
    useGetFlightDetail(booking.flightId!);
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
  const { t } = useTranslation();
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status: queryStatus,
  } = useInfiniteQuery({
    queryKey: ["bookings", status],
    queryFn: ({ pageParam = 1 }) =>
      getBookings({
        status: status.toUpperCase() as "UPCOMING" | "PAST",
        page: pageParam,
        size: 10,
      }),
    getNextPageParam: (lastPage: any) => {
      if (lastPage.data?.last) {
        return undefined;
      }
      return (lastPage.data?.pageNumber ?? -1) + 2;
    },
    initialPageParam: 1,
  });

  const bookings =
    data?.pages.flatMap((page: any) => page.data?.content ?? []) ?? [];
  const noResults = queryStatus === "success" && bookings.length === 0;

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold mb-6">{t("My Bookings")}</h2>

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
            {t("Upcoming")}
          </button>
          <button
            onClick={() => setStatus("past")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              status === "past"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t("Past")}
          </button>
        </nav>
      </div>

      {queryStatus === "pending" ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <BookingCardSkeleton key={index} />
          ))}
        </div>
      ) : queryStatus === "error" ? (
        <p>Error: {error.message}</p>
      ) : noResults ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">
            No {status} bookings
          </h3>
          <p className="text-gray-500 mt-2">
            You don't have any {status} bookings yet.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-400"
            >
              {isFetchingNextPage
                ? t("Loading more...")
                : hasNextPage
                ? t("Load More Bookings")
                : t("No more bookings")}
            </button>
          </div>
          {isFetching && !isFetchingNextPage ? (
            <div className="text-center mt-4">Fetching...</div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default MyBookingsPage;
