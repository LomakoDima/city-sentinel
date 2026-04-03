import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import TrafficMapContainer from "@/components/dashboard/TrafficMapContainer";
import LineChartPanel from "@/components/dashboard/LineChartPanel";
import StatusBar from "@/components/dashboard/StatusBar";
import MiniStatCards from "@/components/dashboard/MiniStatCards";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import KazakhstanCityMaps from "@/components/dashboard/KazakhstanCityMaps";
import { cityLabelMap, fetchTraffic, type CityId } from "@/lib/traffic";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<CityId>("almaty");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["traffic", selectedCity],
    queryFn: () => fetchTraffic(selectedCity),
    refetchInterval: 30000,
  });

  const cityLabel = useMemo(() => cityLabelMap[selectedCity], [selectedCity]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar selectedCity={selectedCity} onCityChange={setSelectedCity} />
      <main className="flex-1 space-y-4 p-3 sm:p-4 lg:overflow-y-auto lg:p-5">
        <StatusBar cityId={selectedCity} cityName={cityLabel} />

        {isLoading && <div className="glass rounded-xl p-4 text-sm text-muted-foreground">Загрузка данных...</div>}
        {isError && <div className="rounded-xl border border-neon-red/40 bg-neon-red/10 p-4 text-sm text-neon-red">Ошибка загрузки данных API.</div>}

        {data && (
          <>
            <MiniStatCards data={data} />
            <KazakhstanCityMaps selectedCity={selectedCity} onSelectCity={setSelectedCity} />
            <TrafficMapContainer cityId={selectedCity} cityName={cityLabel} />
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_320px]">
              <LineChartPanel data={data.congestion_trend_12h} />
              <AIInsightsPanel insight={data.ai_insight} />
            </div>
            <DashboardCharts data={data} />
          </>
        )}

        {!data && !isLoading && !isError && (
          <AIInsightsPanel insight={null} />
        )}
      </main>
    </div>
  );
};

export default Index;
