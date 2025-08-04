import React from "react";
import { useTranslation } from "react-i18next";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { useCreateBooking } from "../api/booking-controller/booking-controller";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type {
  FlightResponseDTO,
  PassengerInfoDTO,
} from "../api/openAPIDefinition.schemas";
import { useModal } from "../context/ModalContext";
import { useForm, useFieldArray } from "react-hook-form";

const FlightReviewCard: React.FC<{
  flight: FlightResponseDTO;
  type: "Outbound" | "Return";
}> = ({ flight, type }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-800">{type}</h3>
    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
      <div>
        <p className="font-bold">
          {flight.departure} → {flight.destination}
        </p>
        <p className="text-sm text-gray-600">
          {flight.departureDate} | {flight.departureTime}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">${flight.price}</p>
      </div>
    </div>
  </div>
);

interface BookingForm {
  passengers: PassengerInfoDTO[];
}

const BookingReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    outboundFlight,
    returnFlight,
    passengers: passengerCount,
  } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const { showLoginModal } = useModal();
  const navigate = useNavigate();
  const mutation = useCreateBooking();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingForm>({
    defaultValues: {
      passengers: Array.from({ length: passengerCount }, (_, index) =>
        index === 0
          ? {
              firstName: user?.firstName ?? "",
              lastName: user?.lastName ?? "",
              email: user?.email ?? "",
            }
          : { firstName: "", lastName: "", email: "" }
      ),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "passengers",
  });

  const onSubmit = async (data: BookingForm) => {
    if (!outboundFlight || !user?.id) {
      toast.error("Booking information is incomplete.");
      return;
    }

    try {
      // 创建去程预订
      const outboundBooking = await mutation.mutateAsync({
        data: {
          flightId: outboundFlight.id!,
          userId: user.id,
          passengers: data.passengers,
        },
      });

      if (!outboundBooking.success) {
        toast.error(`Outbound booking failed: ${outboundBooking.message}`);
        return;
      }

      // 如果有返程航班，则创建返程预订
      if (returnFlight) {
        const returnBooking = await mutation.mutateAsync({
          data: {
            flightId: returnFlight.id!,
            userId: user.id,
            passengers: data.passengers,
          },
        });
        if (!returnBooking.success) {
          toast.error(`Return booking failed: ${returnBooking.message}`);
          return;
        }
      }

      toast.success("Booking successful!");
      navigate("/bookings");
    } catch (error) {
      toast.error("An unexpected error occurred during booking.");
      console.error(error);
    }
  };

  const handleConfirmBooking = () => {
    if (!isAuthenticated) {
      showLoginModal(() => handleSubmit(onSubmit)());
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const baseFare =
    ((parseFloat(outboundFlight?.price as any) || 0) +
      (parseFloat(returnFlight?.price as any) || 0)) *
    passengerCount;
  const taxes = baseFare * 0.1; // 假设税费为10%
  const total = baseFare + taxes;

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold mb-6">{t("Review your flights")}</h2>
      <div className="space-y-8">
        {outboundFlight && (
          <FlightReviewCard flight={outboundFlight} type="Outbound" />
        )}
        {returnFlight && (
          <FlightReviewCard flight={returnFlight} type="Return" />
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-2xl font-semibold mb-4">
            {t("Passenger Information")}
          </h3>
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Passenger {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      {...register(`passengers.${index}.firstName`, {
                        required: "First name is required",
                      })}
                      placeholder="First Name"
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.passengers?.[index]?.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register(`passengers.${index}.lastName`, {
                        required: "Last name is required",
                      })}
                      placeholder="Last Name"
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.passengers?.[index]?.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register(`passengers.${index}.email`, {
                        required: "Email is required",
                      })}
                      placeholder="Email"
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.passengers?.[index]?.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h3 className="text-2xl font-semibold mb-4">{t("Fare summary")}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>
                {t("Base fare")} ({passengerCount} {t("passengers")})
              </span>
              <span>${baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("Taxes, fees, and carrier charges")}</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t">
              <span>{t("Total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button
            type="button" // 改为 type="button" 以避免表单默认提交
            onClick={handleConfirmBooking}
            disabled={mutation.isPending}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {mutation.isPending ? t("Confirming...") : t("Continue to payment")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingReviewPage;
