import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchFlights } from "@/api/flight-controller/flight-controller";
import type {
  FlightResponseDTO,
  ApiResponsePagedResponseDTOFlightResponseDTO,
} from "@/api/openAPIDefinition.schemas";
import FlightCard from "@/components/FlightCard";

function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("departureDate") || "";

  const searchFlightsParams = useMemo(
    () => ({ from, to, date }),
    [from, to, date]
  );

  const { data, isLoading, isError } = useSearchFlights(searchFlightsParams);

  if (isLoading) return <div>正在搜索航班...</div>;

  // 处理真正的网络错误或服务器错误
  if (isError) return <div>搜索航班时出错，请稍后再试。</div>;

  // 检查后端的统一响应格式
  if (data && !data.success) {
    // 根据后端返回的错误码和消息进行不同处理
    if (data.code === 404) {
      // 404 表示未找到航班，这是正常的业务逻辑，不是错误
      return (
        <div className="container mx-auto mt-8">
          <h1 className="text-2xl font-bold mb-4">
            搜索结果: 从 {from} 到 {to}
          </h1>
          <div>未找到符合条件的航班。</div>
        </div>
      );
    } else {
      // 其他业务错误
      return <div>搜索航班时出错：{data.message || "请稍后再试。"}</div>;
    }
  }

  // 正确解析后端的统一响应格式：data.data.content
  // data 是 ApiResponsePagedResponseDTOFlightResponseDTO 类型
  // data.data 是 PagedResponseDTOFlightResponseDTO 类型
  // data.data.content 是 FlightResponseDTO[] 类型
  const flights =
    (data as ApiResponsePagedResponseDTOFlightResponseDTO)?.data?.content || [];

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        搜索结果: 从 {from} 到 {to}
      </h1>
      {flights.length > 0 ? (
        <div className="space-y-4">
          {flights.map((flight: FlightResponseDTO) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      ) : (
        <div>未找到符合条件的航班。</div>
      )}
    </div>
  );
}

export default SearchResultPage;
