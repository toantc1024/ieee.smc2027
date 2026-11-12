"use client";

/* TipTap node attributes are external state and must synchronize with the editing draft. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useCallback, useEffect, useMemo } from "react";
import type { NodeViewProps } from "@tiptap/react";
import {
  BarChart3,
} from "lucide-react";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlockWrapper } from "./block-wrapper";
import { EditableDataTable } from "./editable-data-table";
import { isEditorReviewOnly, isNodeViewInsideLayoutColumn } from "./node-view-utils";

type ChartType = "bar" | "line" | "area" | "pie" | "radar";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
  { value: "radar", label: "Radar" },
];

const DEFAULT_COLORS = ["#4285f4", "#34a853", "#fbbc04", "#ea4335", "#8b5cf6"];

function safeParseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export function ChartBlockView({
  node,
  updateAttributes,
  deleteNode,
  getPos,
  selected,
  editor,
}: NodeViewProps) {
  const { chartType, title, description, data, config, height, caption } =
    node.attrs as {
      chartType: string;
      title: string;
      description: string;
      data: string;
      config: string;
      height: number;
      caption: string;
    };

  const [showSettings, setShowSettings] = useState(false);
  const [localTitle, setLocalTitle] = useState(title || "");
  const [localDesc, setLocalDesc] = useState(description || "");
  const [localCaption, setLocalCaption] = useState(caption || "");
  const isInsideLayoutColumn = isNodeViewInsideLayoutColumn(editor, getPos);
  const [localType, setLocalType] = useState<ChartType>(
    (chartType as ChartType) || "bar",
  );
  const [localHeight, setLocalHeight] = useState(height || 300);

  const chartData = useMemo(
    () => safeParseJSON<Record<string, unknown>[]>(data, []),
    [data],
  );
  const chartConfig = useMemo(
    () => safeParseJSON<{ colors?: string[] }>(config, {}),
    [config],
  );
  const colors = chartConfig.colors || DEFAULT_COLORS;

  const [localData, setLocalData] = useState(chartData);

  // Sync from node attrs
  useEffect(() => {
    setLocalTitle(title || "");
    setLocalDesc(description || "");
    setLocalType((chartType as ChartType) || "bar");
    setLocalHeight(height || 300);
    setLocalCaption(caption || "");
    setLocalData(safeParseJSON(data, []));
  }, [title, description, chartType, height, data, caption]);

  // Get data keys (exclude the first key which is the category/name)
  const allKeys = useMemo(() => {
    if (localData.length === 0) return [];
    return Object.keys(localData[0]);
  }, [localData]);

  const categoryKey = allKeys[0] || "name";
  const valueKeys = allKeys.slice(1);

  // Apply changes
  const handleApply = useCallback(() => {
    updateAttributes({
      chartType: localType,
      title: localTitle,
      description: localDesc,
      data: JSON.stringify(localData),
      height: localHeight,
      caption: localCaption,
    });
    setShowSettings(false);
  }, [
    localType,
    localTitle,
    localDesc,
    localData,
    localHeight,
    localCaption,
    updateAttributes,
  ]);

  // Render chart
  const renderChart = () => {
    const displayData = showSettings ? localData : chartData;
    const type = showSettings ? localType : (chartType as ChartType);
    const h = showSettings ? localHeight : height;

    if (!displayData || displayData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
          No data
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={h} debounce={50}>
        {type === "pie" ? (
          <PieChart>
            <Pie
              data={displayData}
              dataKey={valueKeys[0] || "value"}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(h * 0.35, 120)}
              label={({ name, value }) => `${name}: ${value}`}
              isAnimationActive={false}
            >
              {displayData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : type === "radar" ? (
          <RadarChart data={displayData}>
            <PolarGrid />
            <PolarAngleAxis dataKey={categoryKey} />
            <PolarRadiusAxis />
            {valueKeys.map((key, i) => (
              <Radar
                key={key}
                dataKey={key}
                stroke={colors[i % colors.length]}
                fill={colors[i % colors.length]}
                fillOpacity={0.3}
                isAnimationActive={false}
              />
            ))}
            <Tooltip />
            <Legend />
          </RadarChart>
        ) : type === "area" ? (
          <AreaChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={categoryKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {valueKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[i % colors.length]}
                fill={colors[i % colors.length]}
                fillOpacity={0.3}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        ) : type === "line" ? (
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={categoryKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {valueKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={categoryKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {valueKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[i % colors.length]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const isReviewOnly = isEditorReviewOnly(editor);
  const isEditable = (editor?.isEditable ?? true) && !isReviewOnly;

  return (
    <BlockWrapper
      selected={selected}
      icon={<BarChart3 className="size-3.5 text-blue-500" />}
      label={title || "Chart"}
      editable={isEditable}
      onDelete={deleteNode}
      showSettings={showSettings}
      onToggleSettings={() =>
        showSettings ? handleApply() : setShowSettings(true)
      }
      captionValue={showSettings ? localCaption : (caption || "")}
      onCaptionChange={setLocalCaption}
      dataType="chart-block"
      layout={node.attrs.layout}
      blockWidth={node.attrs.blockWidth}
      blockHeight={node.attrs.blockHeight}
      onLayoutChange={isInsideLayoutColumn ? undefined : (l, w) => updateAttributes({ layout: l, blockWidth: w })}
      onHeightChange={isInsideLayoutColumn ? undefined : (h) => {
        const parsedHeight = h ? parseInt(h, 10) : NaN;
        if (Number.isFinite(parsedHeight)) {
          updateAttributes({ height: parsedHeight, blockHeight: h });
          setLocalHeight(parsedHeight);
        }
      }}
      settingsPanel={
        <>
          {/* Chart type */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
              Type:
            </span>
            <div className="flex gap-1">
              {CHART_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md border transition-colors",
                    localType === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-accent",
                  )}
                  onClick={() => setLocalType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Title
              </label>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder="Chart title"
                className="w-full h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Description
              </label>
              <input
                type="text"
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
                placeholder="Short description"
                className="w-full h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Height */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
              Cao:
            </span>
            <input
              type="number"
              value={localHeight}
              onChange={(e) =>
                setLocalHeight(Math.max(150, parseInt(e.target.value) || 300))
              }
              className="w-20 h-8 rounded-md border bg-background px-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
              onKeyDown={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>

          {/* Data table */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Data
            </label>
            <EditableDataTable
              data={localData}
              onDataChange={setLocalData}
              categoryKey={categoryKey}
            />
          </div>

          {/* Apply button */}
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-7 text-xs"
            >
              Apply changes
            </Button>
          </div>
        </>
      }
    >
      {/* Chart content */}
      <div contentEditable={false} className="select-none">
        {(title || description) && !showSettings && (
          <div className="px-4 pt-3">
            {title && <h4 className="text-sm font-semibold">{title}</h4>}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="px-4 py-3">{renderChart()}</div>
      </div>
    </BlockWrapper>
  );
}
