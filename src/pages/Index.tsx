import Sidebar from "@/components/dashboard/Sidebar";
import CityMap from "@/components/dashboard/CityMap";
import LineChartPanel from "@/components/dashboard/LineChartPanel";
import StatusBar from "@/components/dashboard/StatusBar";
import MiniStatCards from "@/components/dashboard/MiniStatCards";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />
      <main className="flex-1 space-y-4 p-3 sm:p-4 lg:overflow-y-auto lg:p-5">
        <StatusBar />
        <MiniStatCards />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CityMap />
          <LineChartPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
