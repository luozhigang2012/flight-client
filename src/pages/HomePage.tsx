import React, { useMemo } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useGetAirports } from "../api/airport-controller/airport-controller";
import { useBooking } from "../context/BookingContext";
import Autocomplete from "../components/Autocomplete";

// 定义表单的数据结构
interface FlightSearchForm {
  tripType: "one-way" | "round-trip";
  from: string; // 将使用机场代码，例如 'SFO'
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { clearBooking, setPassengers } = useBooking();
  const { data: airportsResponse, isLoading: isLoadingAirports } =
    useGetAirports();

  const {
    register,
    handleSubmit,
    watch,
    control, // 从 useForm 中获取 control
    formState: { errors },
  } = useForm<FlightSearchForm>({
    defaultValues: {
      tripType: "one-way",
      passengers: 1,
    },
  });

  const tripType = watch("tripType");

  const airports = useMemo(() => {
    if (airportsResponse?.data && Array.isArray(airportsResponse.data)) {
      return airportsResponse.data;
    }
    return [];
  }, [airportsResponse]);

  const airportOptions = useMemo(() => {
    return airports.map((airport) => ({
      value: airport.code ?? "",
      label: `${airport.name} (${airport.code})`,
    }));
  }, [airports]);

  const onSubmit: SubmitHandler<FlightSearchForm> = (data) => {
    // 在开始新的搜索之前，清除任何旧的预订信息
    clearBooking();
    // 设置乘客数量
    setPassengers(data.passengers);

    // 找到机场对象以获取城市名称
    const fromAirport = airports.find((a) => a.code === data.from);
    const toAirport = airports.find((a) => a.code === data.to);

    // 将表单数据转换为 URL 查询参数
    const params = new URLSearchParams();
    params.append("tripType", data.tripType);
    params.append("from", data.from);
    params.append("to", data.to);
    params.append("departureDate", data.departureDate);
    if (data.returnDate) {
      params.append("returnDate", data.returnDate);
    }
    params.append("passengers", data.passengers.toString());

    // 添加城市名称
    if (fromAirport) {
      params.append("fromCity", fromAirport.city ?? data.from);
    }
    if (toAirport) {
      params.append("toCity", toAirport.city ?? data.to);
    }

    navigate(`/flights/search?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Background Image Section */}
      <div
        className="h-96 bg-cover bg-center flex flex-col justify-center items-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1570715729793-993169fa7a49?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <h1 className="text-5xl font-bold">Book flights</h1>
        <p className="text-xl mt-2">Find the best fares for your next trip</p>
      </div>

      {/* Search Form Section */}
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg -mt-32 relative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Trip Type */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="one-way"
                {...register("tripType")}
                className="form-radio"
              />
              <span className="ml-2">One-way</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="round-trip"
                {...register("tripType")}
                className="form-radio"
              />
              <span className="ml-2">Round-trip</span>
            </label>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="from" className="block text-sm font-medium">
                From
              </label>
              <Controller
                name="from"
                control={control}
                rules={{ required: "Departure airport is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={airportOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select departure airport"
                    disabled={isLoadingAirports}
                  />
                )}
              />
              {errors.from && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.from.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="to" className="block text-sm font-medium">
                To
              </label>
              <Controller
                name="to"
                control={control}
                rules={{ required: "Arrival airport is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={airportOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select arrival airport"
                    disabled={isLoadingAirports}
                  />
                )}
              />
              {errors.to && (
                <p className="text-red-500 text-sm mt-1">{errors.to.message}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="departureDate"
                className="block text-sm font-medium"
              >
                Depart
              </label>
              <input
                id="departureDate"
                type="date"
                {...register("departureDate", {
                  required: "Departure date is required",
                })}
                className="w-full mt-1 p-2 border rounded-md"
              />
              {errors.departureDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.departureDate.message}
                </p>
              )}
            </div>
            {tripType === "round-trip" && (
              <div>
                <label
                  htmlFor="returnDate"
                  className="block text-sm font-medium"
                >
                  Return
                </label>
                <input
                  id="returnDate"
                  type="date"
                  {...register("returnDate", {
                    required: {
                      value: tripType === "round-trip",
                      message: "Return date is required for round-trip",
                    },
                  })}
                  className="w-full mt-1 p-2 border rounded-md"
                />
                {errors.returnDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.returnDate.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Passengers */}
          <div>
            <label htmlFor="passengers" className="block text-sm font-medium">
              Passengers
            </label>
            <input
              id="passengers"
              type="number"
              min="1"
              {...register("passengers", {
                required: "Number of passengers is required",
                min: { value: 1, message: "At least 1 passenger is required" },
              })}
              className="w-full mt-1 p-2 border rounded-md"
            />
            {errors.passengers && (
              <p className="text-red-500 text-sm mt-1">
                {errors.passengers.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
            >
              Search flights
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
