"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Award,
  BookOpen,
  DollarSign,
  GraduationCap,
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardItem {
  id?: string;
  value: string;
  label: string;
  trend?: string;
  icon?: "award" | "book" | "money" | "grad";
}

export interface ChartDataPoint {
  label: string;
  value1: number;
  value2?: number;
}

export interface StatsChartBlockProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  chartType?: "bar" | "line" | "area" | "pie";
  series1Name?: string;
  series2Name?: string;
  metrics?: MetricCardItem[];
  dataPoints?: ChartDataPoint[];
}

export function StatsChartBlock({
  sectionTitle = "",
  sectionSubtitle = "",
  chartType = "bar",
  series1Name = "",
  series2Name = "",
  metrics,
  dataPoints,
}: StatsChartBlockProps) {
  const [activeType, setActiveType] = useState<"bar" | "line" | "area" | "pie">(chartType);

  const defaultMetrics: MetricCardItem[] = [];

  const defaultData: ChartDataPoint[] = [];

  const metricsList = Array.isArray(metrics) ? metrics : defaultMetrics;
  const chartData = Array.isArray(dataPoints) ? dataPoints : defaultData;

  const COLORS = ["#2563eb", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

  const renderMetricIcon = (iconName?: string) => {
    switch (iconName) {
      case "book":
        return <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />;
      case "money":
        return <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />;
      case "grad":
        return <GraduationCap className="size-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Award className="size-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <section className="w-full py-12 lg:py-16 bg-white dark:bg-zinc-900 font-sans border-y border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <TrendingUp className="size-3.5" />
            <span>Metrics & statistics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground dark:text-white tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* 4 Key Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsList.map((m, idx) => (
            <div
              key={m.id || idx}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-center shadow-xs">
                  {renderMetricIcon(m.icon)}
                </div>
                {m.trend && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    <TrendingUp className="size-3" />
                    <span>{m.trend}</span>
                  </span>
                )}
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-foreground dark:text-white tracking-tight">
                  {m.value}
                </p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  {m.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Chart Container */}
        <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          {/* Chart Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground dark:text-white">
                Chart
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                
              </p>
            </div>

            {/* Switch Chart Type */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveType("bar")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer",
                  activeType === "bar"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                )}
                title="Bar chart"
              >
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Bar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("line")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer",
                  activeType === "line"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                )}
                title="Line chart"
              >
                <LineIcon className="size-4" />
                <span className="hidden sm:inline">Line</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("area")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer",
                  activeType === "area"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                )}
                title="Area chart"
              >
                <TrendingUp className="size-4" />
                <span className="hidden sm:inline">Area</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("pie")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer",
                  activeType === "pie"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                )}
                title="Pie chart"
              >
                <PieIcon className="size-4" />
                <span className="hidden sm:inline">Pie</span>
              </button>
            </div>
          </div>

          {/* Chart Render */}
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              {activeType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value1" name={series1Name} fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="value2" name={series2Name} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : activeType === "line" ? (
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value1" name={series1Name} stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="value2" name={series2Name} stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              ) : activeType === "area" ? (
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVal1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="value1" name={series1Name} stroke="#2563eb" fillOpacity={1} fill="url(#colorVal1)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="value2" name={series2Name} stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVal2)" strokeWidth={2.5} />
                </AreaChart>
              ) : (
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Pie
                    data={chartData.map((d) => ({ name: d.label, value: d.value1 }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={3}
                    label
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
