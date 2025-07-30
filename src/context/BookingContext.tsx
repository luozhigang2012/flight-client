import React, { createContext, useContext, useState } from "react";
import type { FlightResponseDTO } from "../api/openAPIDefinition.schemas";

// 定义 BookingContext 的数据结构
interface BookingContextType {
  outboundFlight: FlightResponseDTO | null;
  returnFlight: FlightResponseDTO | null;
  passengers: number;
  setPassengers: (count: number) => void;
  selectOutboundFlight: (flight: FlightResponseDTO) => void;
  selectReturnFlight: (flight: FlightResponseDTO) => void;
  clearBooking: () => void;
}

// 创建 BookingContext
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// 创建 BookingProvider 组件
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [outboundFlight, setOutboundFlight] =
    useState<FlightResponseDTO | null>(null);
  const [returnFlight, setReturnFlight] = useState<FlightResponseDTO | null>(
    null
  );
  const [passengers, setPassengers] = useState<number>(1);

  const selectOutboundFlight = (flight: FlightResponseDTO) => {
    setOutboundFlight(flight);
  };

  const selectReturnFlight = (flight: FlightResponseDTO) => {
    setReturnFlight(flight);
  };

  const clearBooking = () => {
    setOutboundFlight(null);
    setReturnFlight(null);
    setPassengers(1); // 清除时重置乘客数量
  };

  return (
    <BookingContext.Provider
      value={{
        outboundFlight,
        returnFlight,
        passengers,
        setPassengers,
        selectOutboundFlight,
        selectReturnFlight,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// 创建一个自定义 Hook，方便子组件使用 BookingContext
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
