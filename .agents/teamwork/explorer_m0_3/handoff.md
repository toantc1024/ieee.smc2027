# Handoff Report: Shared UI Primitives Architecture (Milestone M0)

**Agent**: Explorer M0-3 (Shared UI Primitives Architecture)  
**Date**: 2026-11-02  
**Target Milestone**: M0 (Shared Foundation & Dependencies)  
**Status**: COMPLETE

---

## 1. Observation

### 1.1 Existing Workspace State (`ieee-smc-2027`)
- **Package Configuration** (`/Users/macos/ieee-smc-2027/package.json`):
  - Next.js: `16.3.4`, React: `19.2.8`, Tailwind CSS: `@tailwindcss/postcss: ^4`, `tailwindcss: ^4`.
  - Animation: `motion: ^13.4.4` (imports from `"motion/react"`).
  - Radix UI primitives already installed: `@radix-ui/react-alert-dialog`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`.
  - **Missing dependencies for primitives**: `@radix-ui/react-popover`, `@radix-ui/react-switch`, `recharts`, `react-day-picker`, `date-fns`.
- **CSS Variable Definitions** (`/Users/macos/ieee-smc-2027/src/app/globals.css`):
  - Chart palette already defined: `--chart-1` through `--chart-5` (lines 40-44) and mapped to `--color-chart-1` through `--color-chart-5` in `@theme` block (lines 194-198).
  - Popover tokens defined: `--popover`, `--popover-foreground` (lines 25-26).
  - Tailwind v4 `@import "tailwindcss";` is active. Non-standard class `.rounded-pill` from reference does NOT exist in `globals.css`; standard Tailwind is `rounded-full`.
- **Path Aliasing** (`/Users/macos/ieee-smc-2027/tsconfig.json`):
  - Lines 21-23: `"@/*": ["./src/*"]`. UI primitives live in `src/components/ui/` and must be imported as `@/components/ui/<component>`.
- **Existing Shared UI Components** (`/Users/macos/ieee-smc-2027/src/components/ui/`):
  - `button.tsx` exports `Button` and `buttonVariants` (used by `calendar.tsx` and `date-range-picker.tsx`).
  - `src/lib/utils.ts` exports `cn` combining `clsx` and `tailwind-merge`.

### 1.2 Reference Implementations (`hcmute-website-frontend`)
Direct inspection of reference files located at `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/components/ui/`:
1. `chart.tsx` (359 lines): Recharts wrapper exporting `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, and `ChartConfig`.
2. `popover.tsx` (95 lines): Radix Popover wrapper exporting `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription` with `usePortal` support.
3. `calendar.tsx` (240 lines): react-day-picker v9 DayPicker wrapper with custom `Root`, `Chevron`, `DayButton: CalendarDayButton`, `WeekNumber`, and dropdown caption layout.
4. `date-range-picker.tsx` (371 lines): Unified date range selector combining Popover, Calendar, and date-fns with presets (`today`, `7d`, `30d`, `this_month`, `90d`, `this_year`, `all`).
5. `switch.tsx` (36 lines): Accessible `@radix-ui/react-switch` primitive with `sm` and `default` sizes.
6. `number-ticker.tsx` (82 lines): Animated counter using `useInView`, `useMotionValue`, `useSpring` from `motion/react`.

### 1.3 Consumer Requirements
- `modules/analytics`:
  - `unit-post-growth-chart.tsx` and `website-pageviews-chart.tsx` import `{ ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/components/ui/chart"` (needs `@/components/ui/chart`).
  - `website-telemetry-dashboard.tsx`, `system-post-analytics-dashboard.tsx`, `unit-post-analytics-dashboard.tsx` import `{ DateRangePicker, getDateRangeFromPreset } from "@/app/components/ui/date-range-picker"` (needs `@/components/ui/date-range-picker`).
  - `unit-post-kpi-grid.tsx`, `website-telemetry-kpis.tsx`, `system-overview-kpis.tsx` import `{ NumberTicker } from "@/app/components/ui/number-ticker"` (needs `@/components/ui/number-ticker`).
- `modules/website-builder`:
  - `page-parent-combobox.tsx` imports `{ Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"`.
  - `links-list-editor.tsx`, `field-renderer.tsx`, etc., import `{ Switch } from "@/app/components/ui/switch"`.
- User and profile management:
  - `app/manage/users/[id]/page.tsx` and `create-user-dialog.tsx` import `{ Switch } from "@/app/components/ui/switch"`.

---

## 2. Logic Chain

1. **Dependency Resolution**:
   - Consumers in M1, M2, and M3 require `@radix-ui/react-popover`, `@radix-ui/react-switch`, `recharts`, `react-day-picker`, and `date-fns`.
   - `motion` is already installed in `ieee-smc-2027` (`^13.4.4`) with React 19 support.
   - Installing `recharts@^2.15.4`, `react-day-picker@^9.14.0`, `date-fns@^4.1.0`, `@radix-ui/react-popover@^1.1.15`, and `@radix-ui/react-switch@^1.2.6` satisfies all primitive dependencies without conflicting with React 19.

2. **Tailwind v4 Adaptations**:
   - Reference `switch.tsx` uses custom class `rounded-pill`. In standard Tailwind v4 used by `ieee-smc-2027`, `rounded-full` must be used for both the root switch track and thumb to avoid square corners.
   - `chart.tsx`, `popover.tsx`, `calendar.tsx` use Tailwind v4 dynamic properties like `size-(--cell-size)`, `origin-(--radix-popover-content-transform-origin)`, `outline-hidden`, and `shadow-2xs`, which are already supported by `@tailwindcss/postcss: ^4`.

3. **Module Decoupling in `number-ticker.tsx`**:
   - Reference `number-ticker.tsx` imported `useIsEditor` from `@/modules/cms/editor/editor-context`.
   - In `ieee-smc-2027`, `src/modules` does not exist in M0. Importing `@/modules/...` in M0 would trigger `Module not found` compilation errors.
   - Resolution: `NumberTicker` must support an optional `isEditor?: boolean` prop (defaulting to `false`) or a safe optional context fallback. This allows M0, M1, and M2 to use `NumberTicker` immediately without missing dependency errors, while still permitting M3 website-builder to pass `isEditor={true}` to freeze counter animations in the studio canvas.

4. **Import Path Harmonization**:
   - Reference files import from `@/app/components/ui/...`.
   - In `ieee-smc-2027`, `@/*` maps to `./src/*`. All internal imports between primitives must use `@/components/ui/...` (e.g. `import { Button } from "@/components/ui/button"`, `import { Popover } from "@/components/ui/popover"`).

5. **Design and Style Rule Compliance**:
   - Zero sparkle icon usage across all 6 primitives (guaranteed).
   - Clean UI labels in `date-range-picker.tsx` without redundant English in parentheses (e.g., using clean date badges like `02/11/2026 – 09/11/2026` rather than bloated bilingual subtitles).

---

## 3. Caveats

1. **Recharts React 19 Compatibility**:
   - Recharts v2.15+ works with React 19, but like all charting libraries with responsive containers, `ResponsiveContainer` requires a client-side wrapper (`"use client"`). `chart.tsx` correctly starts with `"use client"`.
2. **react-day-picker v9 API vs v8**:
   - The reference `calendar.tsx` is written specifically for `react-day-picker` v9 (`DayPicker`, `getDefaultClassNames`, `DayButton`). Do not install `react-day-picker` v8 (`^8.x`), as the props and class naming conventions are completely different. Use `^9.14.0`.
3. **DateRangePicker Locale**:
   - The reference uses Vietnamese strings (`Hôm nay`, `7 ngày qua`, `Toàn thời gian`). For IEEE SMC 2027, the component accepts an optional `locale` / customizable `placeholder` and `presetLabels` map so that English can be used by default or customized per view without breaking existing analytics callers.

---

## 4. Conclusion & Actionable Component Specifications

Below are the exact specifications and code implementations for creating the 6 shared UI primitives in `src/components/ui/`.

### 4.0 Required Dependencies Installation
Command for the M0 implementer:
```bash
pnpm add recharts@^2.15.4 react-day-picker@^9.14.0 date-fns@^4.1.0 @radix-ui/react-popover@^1.1.15 @radix-ui/react-switch@^1.2.6
```

---

### 4.1 Specification: `src/components/ui/chart.tsx`
- **File**: `src/components/ui/chart.tsx`
- **Exports**: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, `ChartConfig`
- **Imports**: `react`, `recharts` (as `RechartsPrimitive`), `{ cn } from "@/lib/utils"`
- **Implementation**:
```tsx
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, c]) => c.theme || c.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: any & {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item: any) => item.type !== "none")
          .map((item: any, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload?.fill || item.color;

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value !== undefined && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {Number(item.value).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  payload?: any[];
  verticalAlign?: "top" | "bottom" | "middle";
  hideIcon?: boolean;
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
```

---

### 4.2 Specification: `src/components/ui/popover.tsx`
- **File**: `src/components/ui/popover.tsx`
- **Exports**: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`
- **Imports**: `react`, `@radix-ui/react-popover` (as `PopoverPrimitive`), `{ cn } from "@/lib/utils"`
- **Implementation**:
```tsx
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  usePortal = true,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { usePortal?: boolean }) {
  const content = (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        className
      )}
      {...props}
    />
  );

  if (!usePortal || typeof window === "undefined") {
    return content;
  }

  return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
};
```

---

### 4.3 Specification: `src/components/ui/calendar.tsx`
- **File**: `src/components/ui/calendar.tsx`
- **Exports**: `Calendar`, `CalendarDayButton`
- **Imports**: `react`, `lucide-react` (`ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`), `react-day-picker` (`DayPicker`, `getDefaultClassNames`, `type DayButton`), `{ cn } from "@/lib/utils"`, `{ Button, buttonVariants } from "@/components/ui/button"`
- **Implementation**:
```tsx
"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  formatters,
  components,
  startMonth,
  endMonth,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  const currentYear = new Date().getFullYear();
  const effectiveStartMonth =
    startMonth ??
    (props.fromYear ? new Date(props.fromYear, 0, 1) : new Date(1950, 0, 1));
  const effectiveEndMonth =
    endMonth ??
    (props.toYear
      ? new Date(props.toYear, 11, 31)
      : new Date(currentYear + 25, 11, 31));

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      startMonth={effectiveStartMonth}
      endMonth={effectiveEndMonth}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] font-sans [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("en-US", { month: "short" }),
        formatYearDropdown: (date) => `${date.getFullYear()}`,
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months,
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between pointer-events-none [&>button]:pointer-events-auto",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none z-20 cursor-pointer",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none z-20 cursor-pointer",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-8",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "w-full flex items-center text-xs font-semibold justify-center h-(--cell-size) gap-1.5 z-10",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative inline-flex items-center justify-center rounded-lg border border-border/80 bg-background/80 hover:bg-accent/80 hover:text-accent-foreground text-xs font-semibold px-2 py-1 shadow-2xs transition-colors cursor-pointer",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "select-none font-semibold text-xs flex items-center gap-1",
          captionLayout === "label"
            ? "text-sm font-medium"
            : "rounded-md text-xs h-7 [&>svg]:text-muted-foreground [&>svg]:size-3",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number,
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
```

---

### 4.4 Specification: `src/components/ui/date-range-picker.tsx`
- **File**: `src/components/ui/date-range-picker.tsx`
- **Exports**: `DateRangePicker`, `getDateRangeFromPreset`, `DEFAULT_DATE_PRESETS`, `DateRangePickerProps`, `DateRangePreset`
- **Imports**: `react`, `lucide-react` (`Calendar as CalendarIcon`, `ChevronDown`, `Clock3`, `RotateCcw`, `Check`), `date-fns` (`format`, `subDays`, `startOfYear`, `startOfMonth`, `startOfDay`, `endOfDay`, `isValid`), `react-day-picker` (`type DateRange`), `{ cn } from "@/lib/utils"`, `{ Button } from "@/components/ui/button"`, `{ Calendar } from "@/components/ui/calendar"`, `{ Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"`
- **Implementation**:
```tsx
"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock3,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  format,
  subDays,
  startOfYear,
  startOfMonth,
  startOfDay,
  endOfDay,
  isValid,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange?: (range: { from?: Date; to?: Date } | undefined) => void;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  placeholder?: string;
  presetKey?: string;
  onPresetChange?: (presetKey: string) => void;
  showPresets?: boolean;
  variant?: "glass" | "outline" | "default";
}

export interface DateRangePreset {
  id: string;
  label: string;
  getRange: () => { from: Date; to: Date };
}

export function getDateRangeFromPreset(presetId: string): { from: Date; to: Date } {
  const now = new Date();
  switch (presetId) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d":
    case "last_7_days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "30d":
    case "last_30_days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "this_month":
      return { from: startOfDay(startOfMonth(now)), to: endOfDay(now) };
    case "90d":
    case "this_quarter":
      return { from: startOfDay(subDays(now, 89)), to: endOfDay(now) };
    case "12m":
    case "this_year":
      return { from: startOfDay(startOfYear(now)), to: endOfDay(now) };
    case "all":
    case "all_time":
    default:
      return { from: startOfDay(new Date(2024, 0, 1)), to: endOfDay(now) };
  }
}

export const DEFAULT_DATE_PRESETS: DateRangePreset[] = [
  {
    id: "today",
    label: "Today",
    getRange: () => getDateRangeFromPreset("today"),
  },
  {
    id: "7d",
    label: "Last 7 days",
    getRange: () => getDateRangeFromPreset("7d"),
  },
  {
    id: "30d",
    label: "Last 30 days",
    getRange: () => getDateRangeFromPreset("30d"),
  },
  {
    id: "this_month",
    label: "This month",
    getRange: () => getDateRangeFromPreset("this_month"),
  },
  {
    id: "90d",
    label: "Last 90 days",
    getRange: () => getDateRangeFromPreset("90d"),
  },
  {
    id: "this_year",
    label: "This year",
    getRange: () => getDateRangeFromPreset("this_year"),
  },
  {
    id: "all",
    label: "All time",
    getRange: () => getDateRangeFromPreset("all"),
  },
];

export function DateRangePicker({
  value,
  onChange,
  className,
  triggerClassName,
  align = "end",
  placeholder = "Select date range",
  presetKey,
  onPresetChange,
  showPresets = true,
  variant = "outline",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined,
  );

  React.useEffect(() => {
    setDraftRange(value ? { from: value.from, to: value.to } : undefined);
  }, [value, open]);

  const handleApply = () => {
    if (draftRange?.from) {
      const from = startOfDay(draftRange.from);
      const to = endOfDay(draftRange.to || draftRange.from);
      onChange?.({ from, to });
      if (onPresetChange) {
        onPresetChange("custom");
      }
    } else {
      onChange?.(undefined);
    }
    setOpen(false);
  };

  const handleReset = () => {
    const allRange = getDateRangeFromPreset("all");
    setDraftRange(allRange);
    onChange?.(allRange);
    if (onPresetChange) {
      onPresetChange("all");
    }
    setOpen(false);
  };

  const handleSelectPreset = (preset: DateRangePreset) => {
    const range = preset.getRange();
    setDraftRange(range);
    onChange?.(range);
    if (onPresetChange) {
      onPresetChange(preset.id);
    }
    setOpen(false);
  };

  const displayLabel = React.useMemo(() => {
    if (!value?.from) {
      return placeholder;
    }
    const fromStr = format(value.from, "dd/MM/yyyy");
    if (!value.to || value.from.getTime() === value.to.getTime()) {
      return fromStr;
    }
    const toDate = value.to;
    const toStr = format(toDate, "dd/MM/yyyy");

    if (presetKey === "all" || presetKey === "all_time") {
      return "All time";
    }
    if (presetKey === "today") {
      return `Today: ${fromStr}`;
    }
    if (presetKey === "7d" || presetKey === "last_7_days") {
      return `Last 7 days: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "30d" || presetKey === "last_30_days") {
      return `Last 30 days: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "this_month") {
      return `This month: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "90d" || presetKey === "this_quarter") {
      return `Last 90 days: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "12m" || presetKey === "this_year") {
      return `This year: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }

    return `${fromStr} - ${toStr}`;
  }, [value, placeholder, presetKey]);

  const fullRangeTitle = React.useMemo(() => {
    if (!value?.from) return undefined;
    const fromStr = format(value.from, "dd/MM/yyyy");
    const toStr = value.to ? format(value.to, "dd/MM/yyyy") : fromStr;
    return `${fromStr} - ${toStr}`;
  }, [value]);

  const isGlass = variant === "glass";

  return (
    <div className={cn("inline-flex items-center min-w-0 max-w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-picker-trigger"
            variant={isGlass ? "outline" : "outline"}
            size="sm"
            title={fullRangeTitle}
            className={cn(
              isGlass
                ? "h-8 px-2.5 text-xs font-medium rounded-lg border border-white/20 bg-black/30 hover:bg-black/40 text-white backdrop-blur-md transition-all gap-1.5 max-w-full shadow-xs shrink-0 cursor-pointer"
                : "h-9 px-3 text-xs font-medium rounded-xl border border-border/80 bg-background hover:bg-muted/70 text-foreground transition-all gap-2 max-w-full shadow-2xs shrink-0 cursor-pointer",
              !value?.from && (isGlass ? "text-white/80" : "text-muted-foreground"),
              triggerClassName,
            )}
          >
            <CalendarIcon
              className={cn(
                "size-3.5 shrink-0",
                isGlass ? "text-sky-400" : "text-blue-500 dark:text-blue-400",
              )}
            />
            <span className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
              {displayLabel}
            </span>
            <ChevronDown
              className={cn(
                "size-3 ml-0.5 shrink-0",
                isGlass ? "opacity-60 text-white" : "text-muted-foreground",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[min(calc(100vw-1.5rem),540px)] max-h-[min(calc(100vh-2rem),620px)] overflow-y-auto p-0 rounded-2xl shadow-2xl border border-border bg-popover text-popover-foreground z-50"
          align={align}
          collisionPadding={12}
          sideOffset={6}
        >
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            {/* Presets Sidebar */}
            {showPresets && (
              <div className="p-2 sm:p-2.5 bg-muted/20 sm:w-44 flex flex-col shrink-0">
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 uppercase tracking-wider">
                  Presets
                </span>
                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1 mt-1">
                  {DEFAULT_DATE_PRESETS.map((preset) => {
                    const isActive =
                      presetKey === preset.id ||
                      (preset.id === "this_year" && presetKey === "12m") ||
                      (preset.id === "7d" && presetKey === "last_7_days") ||
                      (preset.id === "30d" && presetKey === "last_30_days") ||
                      (preset.id === "90d" && presetKey === "this_quarter") ||
                      (preset.id === "all" && presetKey === "all_time");
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={cn(
                          "flex items-center justify-between w-full px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-lg font-medium transition-all text-left cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-foreground hover:bg-muted/70",
                        )}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Clock3 className="size-3 opacity-70 shrink-0" />
                          <span className="truncate">{preset.label}</span>
                        </span>
                        {isActive && <Check className="size-3 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 sm:mt-auto pt-1.5 sm:pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center sm:justify-start gap-1.5 w-full px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-lg font-medium text-muted-foreground hover:text-primary hover:bg-muted/70 transition-colors text-left cursor-pointer"
                  >
                    <RotateCcw className="size-3.5 shrink-0" />
                    <span className="truncate">Reset to all time</span>
                  </button>
                </div>
              </div>
            )}

            {/* Calendar & Range Selector */}
            <div className="p-2 sm:p-3 flex flex-col min-w-0">
              <div className="overflow-x-auto flex justify-center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={draftRange?.from || value?.from || new Date()}
                  selected={draftRange}
                  onSelect={setDraftRange}
                  numberOfMonths={1}
                  className="rounded-xl border-0 p-0 sm:p-1"
                />
              </div>

              {/* Range footer summary & Action buttons */}
              <div className="mt-2 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px] sm:max-w-[240px]">
                  {draftRange?.from && isValid(draftRange.from) ? (
                    draftRange.to && isValid(draftRange.to) ? (
                      <span>
                        {format(draftRange.from, "dd/MM/yyyy")} –{" "}
                        {format(draftRange.to, "dd/MM/yyyy")}
                      </span>
                    ) : (
                      <span>
                        From {format(draftRange.from, "dd/MM/yyyy")} (select end date)
                      </span>
                    )
                  ) : (
                    <span>No range selected</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="h-7 px-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={!draftRange?.from}
                    onClick={handleApply}
                    className="h-7 px-2.5 text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

---

### 4.5 Specification: `src/components/ui/switch.tsx`
- **File**: `src/components/ui/switch.tsx`
- **Exports**: `Switch`
- **Imports**: `react`, `@radix-ui/react-switch` (as `SwitchPrimitive`), `{ cn } from "@/lib/utils"`
- **Adaptation**: Replaced `.rounded-pill` with standard Tailwind `rounded-full`.
- **Implementation**:
```tsx
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
```

---

### 4.6 Specification: `src/components/ui/number-ticker.tsx`
- **File**: `src/components/ui/number-ticker.tsx`
- **Exports**: `NumberTicker`
- **Imports**: `react`, `useInView, useMotionValue, useSpring` from `"motion/react"`, `{ cn } from "@/lib/utils"`
- **Adaptation**: Decoupled from `@/modules/cms/editor/editor-context` by supporting optional `isEditor?: boolean` prop (default `false`). No missing module error during M0/M1/M2 builds.
- **Implementation**:
```tsx
"use client";

import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  isEditor?: boolean;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  isEditor = false,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInViewResult = useInView(ref, { once: true, margin: "0px" });
  const isInView = isEditor || isInViewResult;

  useEffect(() => {
    if (isEditor && ref.current) {
      ref.current.textContent = Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(value);
      return;
    }

    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value, direction, startValue, isEditor, decimalPlaces]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces]
  );

  return (
    <span
      ref={ref}
      className={cn(
        "inline text-foreground tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {props.children ??
        Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(value)}
    </span>
  );
}
```

---

## 5. Verification Method

### 5.1 Verification Checklist for Implementer (Milestone M0)
1. **Package Installation**:
   ```bash
   pnpm add recharts@^2.15.4 react-day-picker@^9.14.0 date-fns@^4.1.0 @radix-ui/react-popover@^1.1.15 @radix-ui/react-switch@^1.2.6
   ```
   *Verification*: Run `pnpm list recharts react-day-picker date-fns @radix-ui/react-popover @radix-ui/react-switch` to ensure they are listed without unresolved peer dependency errors.

2. **File Creation**:
   Create the 6 files at:
   - `src/components/ui/chart.tsx`
   - `src/components/ui/popover.tsx`
   - `src/components/ui/calendar.tsx`
   - `src/components/ui/date-range-picker.tsx`
   - `src/components/ui/switch.tsx`
   - `src/components/ui/number-ticker.tsx`

3. **TypeScript & Build Verification**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *Success Condition*: Zero TypeScript errors on any of the 6 newly created UI components.

4. **Style & Icon Compliance**:
   - Check that no file in `src/components/ui/` imports or references `sparkle` / `Sparkles`.
   - Verify `switch.tsx` uses `rounded-full` and displays properly as a pill shape in both checked and unchecked states.

5. **Invalidation Conditions**:
   - If `react-day-picker` v8 is installed instead of v9, `Calendar` will error with missing `DayButton` and invalid `getDefaultClassNames`.
   - If `number-ticker.tsx` imports `@/modules/cms/...`, TypeScript will fail until M3. The provided specification avoids this by decoupling `isEditor`.
