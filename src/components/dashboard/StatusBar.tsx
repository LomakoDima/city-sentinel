import { motion } from "framer-motion";
import { Wifi, Shield, Clock, Users } from "lucide-react";
import type { CityId } from "@/lib/traffic";

const citySubtitle: Record<CityId, string> = {
  almaty: "Алматы · Южный транспортный узел",
  astana: "Астана · Центр магистральной сети",
  shymkent: "Шымкент · Региональный дорожный контур",
  aktobe: "Актобе · Западный дорожный узел",
  karaganda: "Караганда · Промышленный транспортный хаб",
  pavlodar: "Павлодар · Северо-восточный коридор",
  atyrau: "Атырау · Западный нефтегазовый узел",
  kostanay: "Костанай · Северный аграрный контур",
  taraz: "Тараз · Южный исторический коридор",
  oral: "Орал · Западно-Казахстанский узел",
  semey: "Семей · Восточный транспортный контур",
  ust_kamenogorsk: "Усть-Каменогорск · Восточный промышленный хаб",
  petropavl: "Петропавловск · Северный пограничный узел",
  kokshetau: "Кокшетау · Акмолинский дорожный контур",
  taldykorgan: "Талдыкорган · Жетысуский транспортный узел",
  turkistan: "Туркестан · Южный культурный коридор",
  kyzylorda: "Кызылорда · Центрально-южный узел",
  mangystau: "Актау · Каспийский транспортный хаб",
  zhezkazgan: "Жезказган · Центральный промышленный контур",
  ekibastuz: "Экибастуз · Энергетический транспортный узел",
};

interface StatusBarProps {
  cityId: CityId;
  cityName: string;
}

const StatusBar = ({ cityId, cityName }: StatusBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">Главный дашборд · NexaCity OS</h2>
        <p className="text-[11px] text-muted-foreground">Мониторинг умной транспортной системы</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
        {[
          { icon: Users, label: "12.4M", sub: "Population" },
          { icon: Shield, label: "99.7%", sub: "Uptime" },
          { icon: Wifi, label: "Active", sub: "IoT Grid" },
        ].map((item) => (
          <div key={item.sub} className="flex items-center gap-2">
            <item.icon className="w-3.5 h-3.5 text-neon-cyan" />
            <div>
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[9px] text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBar;
