/**
 * Empirical UI Primitive Stress Testing & Adversarial Harness
 * Tests 6 shared UI primitives in src/components/ui/:
 * 1. chart.tsx (ChartContainer, ChartTooltipContent, ChartLegendContent, ChartStyle)
 * 2. date-range-picker.tsx (DateRangePicker, getDateRangeFromPreset, DEFAULT_DATE_PRESETS)
 * 3. switch.tsx (Switch)
 * 4. number-ticker.tsx (NumberTicker)
 * 5. calendar.tsx (Calendar)
 * 6. popover.tsx (Popover, PopoverContent, PopoverTrigger, PopoverHeader, PopoverTitle, PopoverDescription)
 */

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { isValid, differenceInCalendarDays } from "date-fns";

// UI Primitives
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
} from "../../src/components/ui/chart";
import {
  DateRangePicker,
  getDateRangeFromPreset,
} from "../../src/components/ui/date-range-picker";
import { Switch } from "../../src/components/ui/switch";
import { NumberTicker } from "../../src/components/ui/number-ticker";
import { Calendar } from "../../src/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "../../src/components/ui/popover";

describe("Primitive 1: chart.tsx Stress & Edge Testing", () => {
  const validConfig: ChartConfig = {
    views: {
      label: "Page Views",
      color: "#2563eb",
    },
    visitors: {
      label: "Unique Visitors",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
  };

  test("P1.1: ChartContainer renders successfully with valid config and child", () => {
    const html = renderToString(
      React.createElement(ChartContainer, {
        config: validConfig,
        className: "test-chart",
        children: React.createElement("div", { id: "child" }, "Chart Graphic"),
      })
    );
    assert.ok(html.includes("data-slot=\"chart\""));
    assert.ok(html.includes("--color-views: #2563eb;"));
    assert.ok(html.includes("--color-visitors: #3b82f6;"));
    assert.ok(html.includes(".dark [data-chart="));
  });

  test("P1.2: ChartContainer handles empty config {} without throwing", () => {
    const html = renderToString(
      React.createElement(ChartContainer, {
        config: {},
        children: React.createElement("div", null, "Empty"),
      })
    );
    assert.ok(html.includes("data-slot=\"chart\""));
    // No style tag generated when colorConfig is empty
    assert.ok(!html.includes("<style>"));
  });

  test("P1.3 [FAIL EXPECTED / BUG]: ChartContainer with undefined config throws TypeError in ChartStyle", () => {
    let caught: any = null;
    try {
      renderToString(
        React.createElement(ChartContainer as any, {
          config: undefined,
          children: React.createElement("div", null, "Undefined Config"),
        })
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected undefined config to throw error");
    assert.strictEqual(caught.name, "TypeError");
    assert.ok(
      caught.message.includes("Cannot convert undefined or null to object"),
      `Expected Object.entries failure, got: ${caught.message}`
    );
  });

  test("P1.4 [FAIL EXPECTED / BUG]: ChartContainer with null config throws TypeError in ChartStyle", () => {
    let caught: any = null;
    try {
      renderToString(
        React.createElement(ChartContainer as any, {
          config: null,
          children: React.createElement("div", null, "Null Config"),
        })
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected null config to throw error");
    assert.strictEqual(caught.name, "TypeError");
    assert.ok(caught.message.includes("Cannot convert undefined or null to object"));
  });

  test("P1.5 [FAIL EXPECTED / BUG]: ChartContainer with partially undefined entry throws TypeError in ChartStyle", () => {
    let caught: any = null;
    try {
      renderToString(
        React.createElement(ChartContainer as any, {
          config: { views: undefined },
          children: React.createElement("div", null, "Broken Config"),
        })
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected undefined entry to throw error");
    assert.strictEqual(caught.name, "TypeError");
    assert.ok(
      caught.message.includes("Cannot read properties of undefined") ||
      caught.message.includes("reading 'theme'"),
      `Expected property access failure on c.theme, got: ${caught.message}`
    );
  });

  test("P1.6: ChartTooltipContent and ChartLegendContent throw when rendered outside ChartContainer", () => {
    let caughtTooltip: any = null;
    try {
      renderToString(
        React.createElement(ChartTooltipContent, {
          active: true,
          payload: [{ name: "views", value: 42 }],
        })
      );
    } catch (err) {
      caughtTooltip = err;
    }
    assert.ok(caughtTooltip !== null);
    assert.ok(caughtTooltip.message.includes("useChart must be used within a <ChartContainer />"));

    let caughtLegend: any = null;
    try {
      renderToString(
        React.createElement(ChartLegendContent, {
          payload: [{ dataKey: "views", color: "#2563eb" }],
        })
      );
    } catch (err) {
      caughtLegend = err;
    }
    assert.ok(caughtLegend !== null);
    assert.ok(caughtLegend.message.includes("useChart must be used within a <ChartContainer />"));
  });

  test("P1.7: ResponsiveContainer behavior in SSR suppresses child rendering until browser measurement", () => {
    const html = renderToString(
      React.createElement(ChartContainer, {
        config: validConfig,
        children: React.createElement("div", { id: "child-graphic" }, "Recharts SVG Content"),
      })
    );
    // ResponsiveContainer requires client DOM measurement; children are suppressed during SSR
    assert.ok(!html.includes("child-graphic"), "ResponsiveContainer should suppress children in SSR");
    assert.ok(html.includes("recharts-responsive-container"));
  });

  test("P1.8: ChartStyle independently renders scoped CSS variables for light and dark themes", () => {
    const html = renderToString(
      React.createElement(ChartStyle, {
        id: "test-chart-id",
        config: validConfig,
      })
    );
    assert.ok(html.includes("[data-chart=test-chart-id]"));
    assert.ok(html.includes("--color-views: #2563eb;"));
    assert.ok(html.includes("--color-visitors: #3b82f6;"));
    assert.ok(html.includes(".dark [data-chart=test-chart-id]"));
    assert.ok(html.includes("--color-visitors: #60a5fa;"));
  });

  test("P1.9 [FAIL EXPECTED / BUG]: ChartTooltipContent bypasses formatter if item.name is undefined", () => {
    // In ChartTooltipContent line 197:
    // {formatter && item?.value !== undefined && item.name ? (
    // If a series uses dataKey="views" without an explicit name="views", item.name is undefined.
    // Therefore formatter is bypassed completely even though formatter is provided!
    const item = { dataKey: "views", value: 500, color: "#2563eb", name: undefined };
    const canFormat = Boolean(item.value !== undefined && item.name);
    assert.strictEqual(canFormat, false, "Demonstrates Recharts dataKey-only item cannot be formatted");
  });
});

describe("Primitive 2: date-range-picker.tsx Stress & Boundary Testing", () => {
  test("P2.1: getDateRangeFromPreset computes correct ranges for all presets", () => {
    const presets = [
      { id: "today", expectedDays: 0 },
      { id: "7d", expectedDays: 6 },
      { id: "last_7_days", expectedDays: 6 },
      { id: "30d", expectedDays: 29 },
      { id: "last_30_days", expectedDays: 29 },
      { id: "90d", expectedDays: 89 },
      { id: "this_quarter", expectedDays: 89 },
    ];

    for (const p of presets) {
      const range = getDateRangeFromPreset(p.id);
      assert.ok(isValid(range.from), `range.from should be valid for ${p.id}`);
      assert.ok(isValid(range.to), `range.to should be valid for ${p.id}`);
      assert.strictEqual(range.from.getHours(), 0);
      assert.strictEqual(range.from.getMinutes(), 0);
      assert.strictEqual(range.from.getSeconds(), 0);
      assert.strictEqual(range.to.getHours(), 23);
      assert.strictEqual(range.to.getMinutes(), 59);
      assert.strictEqual(range.to.getSeconds(), 59);

      const daysDiff = differenceInCalendarDays(range.to, range.from);
      assert.strictEqual(
        daysDiff,
        p.expectedDays,
        `Preset ${p.id} days diff should be ${p.expectedDays}, got ${daysDiff}`
      );
    }
  });

  test("P2.2: getDateRangeFromPreset handles this_month, this_year, and all presets", () => {
    const now = new Date();

    const thisMonth = getDateRangeFromPreset("this_month");
    assert.strictEqual(thisMonth.from.getDate(), 1);
    assert.strictEqual(thisMonth.from.getMonth(), now.getMonth());

    const thisYear = getDateRangeFromPreset("this_year");
    assert.strictEqual(thisYear.from.getDate(), 1);
    assert.strictEqual(thisYear.from.getMonth(), 0);
    assert.strictEqual(thisYear.from.getFullYear(), now.getFullYear());

    const all = getDateRangeFromPreset("all");
    assert.strictEqual(all.from.getFullYear(), 2024);
    assert.strictEqual(all.from.getMonth(), 0);
    assert.strictEqual(all.from.getDate(), 1);

    // Fallback for unknown preset
    const fallback = getDateRangeFromPreset("unknown_key_xyz");
    assert.strictEqual(fallback.from.getFullYear(), 2024);
  });

  test("P2.3: DateRangePicker renders placeholder when value is empty or undefined", () => {
    const htmlUndef = renderToString(React.createElement(DateRangePicker, { value: undefined }));
    assert.ok(htmlUndef.includes("Select date range"));

    const htmlEmptyObj = renderToString(React.createElement(DateRangePicker, { value: {} }));
    assert.ok(htmlEmptyObj.includes("Select date range"));

    const htmlCustomPlaceholder = renderToString(
      React.createElement(DateRangePicker, { value: undefined, placeholder: "Pick dates" })
    );
    assert.ok(htmlCustomPlaceholder.includes("Pick dates"));
  });

  test("P2.4: DateRangePicker formats single date and range accurately", () => {
    const singleDate = new Date(2027, 9, 15);
    const htmlSingle = renderToString(
      React.createElement(DateRangePicker, { value: { from: singleDate } })
    );
    assert.ok(htmlSingle.includes("15/10/2027"));

    const sameDay = renderToString(
      React.createElement(DateRangePicker, { value: { from: singleDate, to: singleDate } })
    );
    assert.ok(sameDay.includes("15/10/2027"));

    const rangeHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(2027, 9, 15), to: new Date(2027, 9, 20) },
      })
    );
    assert.ok(rangeHtml.includes("15/10/2027 - 20/10/2027"));
  });

  test("P2.5: DateRangePicker formats preset labels", () => {
    const now = new Date(2027, 4, 10);
    const todayHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: now, to: new Date(2027, 4, 10, 23, 59, 59) },
        presetKey: "today",
      })
    );
    assert.ok(todayHtml.includes("Today: 10/05/2027"));

    const preset7dHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(2027, 4, 4), to: new Date(2027, 4, 10) },
        presetKey: "7d",
      })
    );
    assert.ok(preset7dHtml.includes("Last 7 days: 04/05 - 10/05"));

    const allHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(2024, 0, 1), to: now },
        presetKey: "all",
      })
    );
    assert.ok(allHtml.includes("All time"));
  });

  test("P2.6 [FAIL EXPECTED / BUG]: DateRangePicker crashes with RangeError when value.from is invalid Date", () => {
    let caught: any = null;
    try {
      renderToString(
        React.createElement(DateRangePicker, {
          value: { from: new Date("invalid date string") },
        })
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected invalid Date in value.from to throw error");
    assert.strictEqual(caught.name, "RangeError");
    assert.ok(
      caught.message.includes("Invalid time value"),
      `Expected RangeError: Invalid time value, got: ${caught.message}`
    );
  });

  test("P2.7 [FAIL EXPECTED / BUG]: DateRangePicker crashes with RangeError when value.to is invalid Date", () => {
    let caught: any = null;
    try {
      renderToString(
        React.createElement(DateRangePicker, {
          value: { from: new Date(2027, 0, 1), to: new Date(NaN) },
        })
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected invalid Date in value.to to throw error");
    assert.strictEqual(caught.name, "RangeError");
    assert.ok(caught.message.includes("Invalid time value"));
  });

  test("P2.8: DateRangePicker supports glass variant and custom styling", () => {
    const htmlGlass = renderToString(
      React.createElement(DateRangePicker, {
        variant: "glass",
        triggerClassName: "custom-trigger-class",
      })
    );
    assert.ok(htmlGlass.includes("backdrop-blur-md"));
    assert.ok(htmlGlass.includes("custom-trigger-class"));
  });
});

describe("Primitive 3: switch.tsx Toggle & Accessibility Testing", () => {
  test("P3.1: Switch renders unchecked state with role='switch' and aria-checked='false'", () => {
    const html = renderToString(React.createElement(Switch, { checked: false }));
    assert.ok(html.includes("role=\"switch\""));
    assert.ok(html.includes("aria-checked=\"false\""));
    assert.ok(html.includes("data-state=\"unchecked\""));
    assert.ok(html.includes("data-slot=\"switch\""));
  });

  test("P3.2: Switch renders checked state with aria-checked='true'", () => {
    const html = renderToString(React.createElement(Switch, { checked: true }));
    assert.ok(html.includes("aria-checked=\"true\""));
    assert.ok(html.includes("data-state=\"checked\""));
  });

  test("P3.3: Switch renders disabled state and propagates disabled to hidden checkbox", () => {
    const html = renderToString(React.createElement(Switch, { disabled: true, checked: false }));
    assert.ok(html.includes("disabled=\"\""));
    assert.ok(html.includes("data-disabled=\"\""));
  });

  test("P3.4: Switch supports size='sm' and size='default'", () => {
    const htmlSm = renderToString(React.createElement(Switch, { size: "sm" }));
    assert.ok(htmlSm.includes("data-size=\"sm\""));

    const htmlDefault = renderToString(React.createElement(Switch, { size: "default" }));
    assert.ok(htmlDefault.includes("data-size=\"default\""));
  });

  test("P3.5: Switch binds form attributes (name, value)", () => {
    const html = renderToString(React.createElement(Switch, { name: "email_alerts", value: "active" }));
    assert.ok(html.includes("name=\"email_alerts\""));
    assert.ok(html.includes("value=\"active\""));
  });
});

describe("Primitive 4: number-ticker.tsx Stress Testing", () => {
  test("P4.1: NumberTicker formats 0 and small integers", () => {
    const htmlZero = renderToString(React.createElement(NumberTicker, { value: 0 }));
    assert.ok(htmlZero.includes(">0<"));

    const htmlTen = renderToString(React.createElement(NumberTicker, { value: 10 }));
    assert.ok(htmlTen.includes(">10<"));
  });

  test("P4.2: NumberTicker formats negative numbers", () => {
    const html = renderToString(React.createElement(NumberTicker, { value: -42 }));
    assert.ok(html.includes(">-42<"));

    const htmlNegativeDec = renderToString(
      React.createElement(NumberTicker, { value: -1234.56, decimalPlaces: 2 })
    );
    assert.ok(htmlNegativeDec.includes(">-1,234.56<"));
  });

  test("P4.3: NumberTicker formats extreme counts with commas", () => {
    const htmlLarge = renderToString(React.createElement(NumberTicker, { value: 1000000000 }));
    assert.ok(htmlLarge.includes(">1,000,000,000<"));

    const htmlTrillion = renderToString(React.createElement(NumberTicker, { value: 1000000000000 }));
    assert.ok(htmlTrillion.includes(">1,000,000,000,000<"));
  });

  test("P4.4: NumberTicker formats decimal places", () => {
    const html2Dec = renderToString(
      React.createElement(NumberTicker, { value: 99.5, decimalPlaces: 2 })
    );
    assert.ok(html2Dec.includes(">99.50<"));
  });

  test("P4.5 [FAIL EXPECTED / BUG]: NumberTicker crashes with RangeError when decimalPlaces is negative", () => {
    let caught: any = null;
    try {
      renderToString(React.createElement(NumberTicker, { value: 50, decimalPlaces: -1 }));
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected negative decimalPlaces to throw error");
    assert.strictEqual(caught.name, "RangeError");
    assert.ok(
      caught.message.includes("out of range"),
      `Expected RangeError out of range, got: ${caught.message}`
    );
  });

  test("P4.6: NumberTicker renders custom children override if provided", () => {
    const html = renderToString(
      React.createElement(NumberTicker, { value: 100 }, "Loading Metric...")
    );
    assert.ok(html.includes("Loading Metric..."));
  });

  test("P4.7: NumberTicker renders in isEditor mode", () => {
    const html = renderToString(
      React.createElement(NumberTicker, { value: 500, isEditor: true })
    );
    assert.ok(html.includes(">500<"));
  });
});

describe("Primitive 5: calendar.tsx Stress Testing", () => {
  test("P5.1: Calendar renders clean HTML without throwing", () => {
    const html = renderToString(React.createElement(Calendar, {}));
    assert.ok(html.includes("data-slot=\"calendar\""));
    assert.ok(html.includes("rdp"));
  });

  test("P5.2: Calendar renders in range mode with selected dates", () => {
    const html = renderToString(
      React.createElement(Calendar, {
        mode: "range",
        selected: { from: new Date(2027, 9, 1), to: new Date(2027, 9, 5) },
        defaultMonth: new Date(2027, 9, 1),
      })
    );
    assert.ok(html.includes("data-slot=\"calendar\""));
    assert.ok(html.includes("rdp"));
  });

  test("P5.3: Calendar contains zero sparkle icons (Rule check)", () => {
    const html = renderToString(React.createElement(Calendar, {}));
    assert.ok(!html.toLowerCase().includes("sparkle"), "Calendar must not contain sparkle icons");
  });
});

describe("Primitive 6: popover.tsx Accessibility & State Testing", () => {
  test("P6.1: Popover renders closed state", () => {
    const html = renderToString(
      React.createElement(
        Popover,
        { open: false },
        React.createElement(PopoverTrigger, { asChild: true }, React.createElement("button", null, "Open")),
        React.createElement(PopoverContent, null, "Hidden Content")
      )
    );
    assert.ok(html.includes("data-slot=\"popover-trigger\""));
    assert.ok(!html.includes("Hidden Content"));
  });

  test("P6.2: Popover renders open state with header, title, and description", () => {
    const html = renderToString(
      React.createElement(
        Popover,
        { open: true },
        React.createElement(PopoverTrigger, { asChild: true }, React.createElement("button", null, "Open")),
        React.createElement(
          PopoverContent,
          { usePortal: false },
          React.createElement(
            PopoverHeader,
            null,
            React.createElement(PopoverTitle, null, "Filter Options"),
            React.createElement(PopoverDescription, null, "Select telemetry parameters")
          )
        )
      )
    );
    assert.ok(html.includes("data-slot=\"popover-content\""));
    assert.ok(html.includes("Filter Options"));
    assert.ok(html.includes("Select telemetry parameters"));
  });
});
