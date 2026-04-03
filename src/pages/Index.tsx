import Sidebar from "@/components/dashboard/Sidebar";
import CityMap from "@/components/dashboard/CityMap";
import LineChartPanel from "@/components/dashboard/LineChartPanel";
import StatusBar from "@/components/dashboard/StatusBar";
import MiniStatCards from "@/components/dashboard/MiniStatCards";

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        <StatusBar />
        <MiniStatCards />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
          <CityMap />
          <LineChartPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
