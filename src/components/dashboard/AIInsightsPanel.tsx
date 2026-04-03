import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, AlertTriangle, ListChecks, Siren, Clock, Activity,
  CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles,
  TrendingUp, TrendingDown, Minus, RefreshCw, BotMessageSquare,
  Search, Database, GitBranch, Info,
} from "lucide-react";
import type { AIInsight } from "@/lib/traffic";

interface AIInsightsPanelProps {
  insight: AIInsight | null | undefined;
}

type TabId = "analysis" | "actions" | "reasoning" | "sources";

const priorityConfig = {
  high: {
    border: "border-neon-red/40",
    bg: "bg-neon-red/5",
    badge: "bg-neon-red/15 text-neon-red",
    pulse: "bg-neon-red",
    label: "Высокая",
    icon: TrendingUp,
    confidence: 92,
  },
  medium: {
    border: "border-neon-orange/40",
    bg: "bg-neon-orange/5",
    badge: "bg-neon-orange/15 text-neon-orange",
    pulse: "bg-neon-orange",
    label: "Средняя",
    icon: Minus,
    confidence: 78,
  },
  low: {
    border: "border-neon-green/40",
    bg: "bg-neon-green/5",
    badge: "bg-neon-green/15 text-neon-green",
    pulse: "bg-neon-green",
    label: "Низкая",
    icon: TrendingDown,
    confidence: 85,
  },
};

const tabs: { id: TabId; label: string; icon: typeof Brain }[] = [
  { id: "analysis", label: "Анализ", icon: Brain },
  { id: "actions", label: "Действия", icon: ListChecks },
  { id: "reasoning", label: "Логика", icon: GitBranch },
  { id: "sources", label: "Источники", icon: Database },
];


const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-10 text-center"
  >
    <div className="relative mb-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <BotMessageSquare className="w-7 h-7 text-primary/40" />
      </div>
      <motion.div
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Sparkles className="w-2.5 h-2.5 text-primary/50" />
      </motion.div>
    </div>
    <p className="font-display text-sm font-semibold text-foreground/70 mb-1">Нет данных для анализа</p>
    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">
      ИИ-система ожидает поступления данных о дорожной обстановке для формирования аналитики
    </p>
    <div className="mt-4 flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <RefreshCw className="w-3 h-3 text-muted-foreground" />
      </motion.div>
      <span className="text-[10px] text-muted-foreground">Ожидание данных...</span>
    </div>
  </motion.div>
);

const AIInsightsPanel = ({ insight }: AIInsightsPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("analysis");
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  const isEmpty = !insight || (!insight.summary && insight.actions.length === 0);

  const config = useMemo(
    () => (insight ? priorityConfig[insight.priority] : priorityConfig.low),
    [insight],
  );

  const toggleAction = (idx: number) => {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const completedCount = checkedActions.size;
  const totalActions = insight?.actions.length ?? 0;
  const progressPct = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className={`glass relative overflow-hidden rounded-xl border ${isEmpty ? "border-border/30" : config.border} ${isEmpty ? "" : config.bg}`}
    >
      {/* Decorative blurs */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-neon-purple/8 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <div className="rounded-lg bg-gradient-to-br from-neon-purple/20 to-primary/10 p-1.5">
            <Brain className="h-4 w-4 text-neon-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-sm font-semibold text-foreground">Анализ ИИ</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Activity className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Обновлено в {timestamp}</span>
            </div>
          </div>
          {!isEmpty && (
            <div className="flex items-center gap-1.5">
              <motion.div
                className={`w-2 h-2 rounded-full ${config.pulse}`}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
                {config.label}
              </span>
            </div>
          )}
        </div>

        {isEmpty ? (
          <div className="px-4 pb-4">
            <EmptyState />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-0.5 px-4 mb-3">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                    {tab.id === "actions" && totalActions > 0 && (
                      <span className={`ml-0.5 rounded-full px-1 py-px text-[8px] font-bold ${
                        isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        {completedCount}/{totalActions}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                {activeTab === "analysis" && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {/* Summary */}
                    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-neon-cyan" />
                        Что происходит?
                      </p>
                      <p className="text-[11px] leading-relaxed text-foreground/80">{insight.summary}</p>
                    </div>

                    {/* Priority + Confidence row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <Siren className="h-3 w-3 text-neon-orange" />
                          Критичность
                        </p>
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.badge.split(" ")[1]}`} />
                          <span className="text-sm font-display font-bold text-foreground">{config.label}</span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-neon-purple" />
                          Уверенность
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-display font-bold text-foreground">{Math.round((insight.confidence ?? 0) * 100)}%</span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-border/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((insight.confidence ?? 0) * 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Model info */}
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${insight.model_version?.startsWith("chatgpt") ? "bg-neon-green" : "bg-neon-orange"}`} />
                        <span className="text-[9px] text-muted-foreground">
                          {insight.model_version?.startsWith("chatgpt") ? "ChatGPT + RAG" : "Rule Engine"}: {insight.model_version}
                        </span>
                      </div>
                      <div className="h-3 w-px bg-border/50" />
                      <span className="text-[9px] text-muted-foreground">
                        {insight.data_sources?.length ?? 0} источник(ов) данных
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "actions" && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    {/* Progress bar */}
                    {totalActions > 0 && (
                      <div className="rounded-lg bg-secondary/30 px-3 py-2 mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-medium text-foreground">Прогресс выполнения</span>
                          <span className="text-[10px] font-bold text-primary">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-neon-green/70 to-neon-green"
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {insight.actions.map((action, idx) => {
                      const isChecked = checkedActions.has(idx);
                      const isExpanded = expandedAction === idx;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`rounded-lg border transition-all ${
                            isChecked
                              ? "border-neon-green/30 bg-neon-green/5"
                              : "border-border/50 bg-background/50"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 p-2.5">
                            <button
                              type="button"
                              onClick={() => toggleAction(idx)}
                              className="mt-0.5 shrink-0"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/50 hover:text-primary transition" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] leading-relaxed ${
                                isChecked ? "text-foreground/50 line-through" : "text-foreground/80"
                              }`}>
                                {action}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedAction(isExpanded ? null : idx)}
                              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-2.5 pt-0 ml-6">
                                  <div className="rounded bg-secondary/50 px-2.5 py-2 text-[10px] text-muted-foreground space-y-1">
                                    <p><span className="font-medium text-foreground/70">Приоритет:</span> {idx === 0 ? "Немедленно" : idx === 1 ? "В течение часа" : "Плановое"}</p>
                                    <p><span className="font-medium text-foreground/70">Исполнитель:</span> {idx === 0 ? "Диспетчерский центр" : idx === 1 ? "Служба управления" : "Аналитический отдел"}</p>
                                    <p><span className="font-medium text-foreground/70">Статус:</span> {isChecked ? "Выполнено" : "Ожидает"}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === "reasoning" && (
                  <motion.div
                    key="reasoning"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    <div className="rounded-lg bg-secondary/30 px-3 py-2 mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Info className="w-3 h-3 text-neon-cyan" />
                        <span className="text-[10px] font-semibold text-foreground">Цепочка рассуждений ИИ</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground">Каждый шаг основан на реальных данных из системы мониторинга</p>
                    </div>
                    {(insight.reasoning && insight.reasoning.length > 0) ? (
                      insight.reasoning.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/50 px-3 py-2.5"
                        >
                          <div className="flex flex-col items-center gap-0.5 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-primary">{idx + 1}</span>
                            </div>
                            {idx < (insight.reasoning?.length ?? 0) - 1 && <div className="w-px h-4 bg-border/40" />}
                          </div>
                          <p className="text-[11px] text-foreground/80 leading-relaxed">{step}</p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-border/30 bg-background/50 p-4 text-center">
                        <GitBranch className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-[10px] text-muted-foreground">Цепочка рассуждений недоступна для этого анализа</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "sources" && (
                  <motion.div
                    key="sources"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    <div className="rounded-lg bg-secondary/30 px-3 py-2 mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Database className="w-3 h-3 text-neon-purple" />
                        <span className="text-[10px] font-semibold text-foreground">Источники данных</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground">Факты из системы, на которых основан анализ. ИИ не выходит за рамки этих данных.</p>
                    </div>
                    {(insight.data_sources && insight.data_sources.length > 0) ? (
                      insight.data_sources.map((source, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                        >
                          <Search className="w-3 h-3 text-neon-cyan shrink-0" />
                          <p className="text-[11px] text-foreground/80">{source}</p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-border/30 bg-background/50 p-4 text-center">
                        <Database className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-[10px] text-muted-foreground">Источники данных недоступны для этого анализа</p>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                        <Info className="w-2.5 h-2.5" />
                        <span>Модель: {insight.model_version ?? "N/A"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;
