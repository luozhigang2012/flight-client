import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchFlights } from "../api/flight-controller/flight-controller";
import FlightCard from "../components/FlightCard";
import FlightCardSkeleton from "../components/FlightCardSkeleton";
import type { FlightResponseDTO } from "../api/openAPIDefinition.schemas";
import { useBooking } from "../context/BookingContext";

const SearchResultPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { outboundFlight } = useBooking();

  // 从 URL 获取所有搜索参数
  const tripType = searchParams.get("tripType") || "one-way";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const fromCity = searchParams.get("fromCity") || from;
  const toCity = searchParams.get("toCity") || to;

  // 判断当前是否在选择返程航班
  const isReturnFlightSelection = tripType === "round-trip" && !!outboundFlight;

  // 根据是否为返程选择，确定 API 查询参数
  const queryParams = {
    from: isReturnFlightSelection ? to : from,
    to: isReturnFlightSelection ? from : to,
    date: isReturnFlightSelection ? returnDate : departureDate,
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["flights", queryParams.from, queryParams.to, queryParams.date],
    queryFn: ({ pageParam = 1 }) =>
      searchFlights({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data?.last) {
        return undefined;
      }
      return (lastPage.data?.pageNumber ?? -1) + 2;
    },
    initialPageParam: 1,
    enabled: !!queryParams.date, // 只有当日期存在时才执行查询
  });

  const flights = data?.pages.flatMap((page) => page.data?.content ?? []) ?? [];
  const noResults =
    status === "success" && (data?.pages[0]?.data?.content?.length ?? 0) === 0;

  return (
    <div className="container mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6">
        {isReturnFlightSelection
          ? t("Select your return flight")
          : t("Select your outbound flight")}
      </h1>
      <h2 className="text-xl mb-4">
        {t("From")}{" "}
        <span className="font-semibold">
          {isReturnFlightSelection ? toCity : fromCity}
        </span>{" "}
        {t("To")}{" "}
        <span className="font-semibold">
          {isReturnFlightSelection ? fromCity : toCity}
        </span>
      </h2>

      {status === "pending" ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <FlightCardSkeleton key={index} />
          ))}
        </div>
      ) : status === "error" ? (
        <p>Error: {error.message}</p>
      ) : noResults ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">
            {t("No flights found")}
          </h3>
          <p className="text-gray-500 mt-2">
            We couldn't find any flights for the selected route and date.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600"
          >
            {t("Modify Search")}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {flights.map((flight: FlightResponseDTO) => (
              <FlightCard key={flight.id} flight={flight} />
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
                ? t("Load More Flights")
                : t("No more flights")}
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

export default SearchResultPage;
