/**
 * Empirical Adversarial Challenge & Stress Test Harness
 * Author: Challenger M0-R2-1
 *
 * Targets:
 * - src/components/ui/date-range-picker.tsx
 * - src/components/ui/chart.tsx
 * - src/components/ui/number-ticker.tsx
 *
 * Focus:
 * - Hostile edge-case mining (invalid dates, prototype pollution, non-finite numbers)
 * - Out-of-bounds decimal precision clamping
 * - Regressions against previous defect vectors
 * - Sparkle icon and subtitle formatting compliance
 */

import test, { describe } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { isValid, differenceInCalendarDays } from "date-fns";

// Component imports
import {
  DateRangePicker,
  getDateRangeFromPreset,
  DEFAULT_DATE_PRESETS,
} from "../../src/components/ui/date-range-picker";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
  ChartContext,
  type ChartConfig,
} from "../../src/components/ui/chart";
import { NumberTicker } from "../../src/components/ui/number-ticker";

// ============================================================================
// SUITE 1: DateRangePicker Adversarial Stress Tests
// ============================================================================
describe("Adversarial Suite 1: DateRangePicker Edge Cases & Fuzzing", () => {
  test("ADV-DRP.1: Inverted Date Range (from > to) formats cleanly without crashing", () => {
    const from = new Date(2027, 10, 25);
    const to = new Date(2027, 10, 15);
    const html = renderToString(
      React.createElement(DateRangePicker, {
        value: { from, to },
      })
    );
    assert.ok(html.includes("25/11/2027 - 15/11/2027"));
    assert.ok(html.includes("title=\"25/11/2027 - 15/11/2027\""));
  });

  test("ADV-DRP.2: Extreme & Boundary Dates (Epoch, Leap Day, Year 9999, Min/Max Dates)", () => {
    // Unix Epoch
    const epochHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(0), to: new Date(0) },
      })
    );
    assert.ok(epochHtml.includes("01/01/1970"));

    // Leap Day
    const leapHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(2028, 1, 29), to: new Date(2028, 1, 29) },
      })
    );
    assert.ok(leapHtml.includes("29/02/2028"));

    // Distant Future
    const futureHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(9999, 11, 31), to: new Date(9999, 11, 31) },
      })
    );
    assert.ok(futureHtml.includes("31/12/9999"));

    // Max ECMAScript Date
    const maxDateHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(8640000000000000) },
      })
    );
    assert.ok(maxDateHtml.length > 0);
  });

  test("ADV-DRP.3: Asymmetric / Partially Corrupted Date Objects", () => {
    // Valid from, missing to
    const htmlValidFrom = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(2027, 4, 1), to: undefined },
      })
    );
    assert.ok(htmlValidFrom.includes("01/05/2027"));

    // Missing from, valid to -> should render placeholder
    const htmlMissingFrom = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: undefined, to: new Date(2027, 4, 1) },
      })
    );
    assert.ok(htmlMissingFrom.includes("Select date range"));

    // Invalid from (NaN), valid to -> should render placeholder
    const htmlInvalidFrom = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(NaN), to: new Date(2027, 4, 1) },
      })
    );
    assert.ok(htmlInvalidFrom.includes("Select date range"));

    // Valid from, invalid to (NaN) -> should render single valid from date
    const htmlInvalidTo = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: new Date(2027, 4, 1), to: new Date(NaN) },
      })
    );
    assert.ok(htmlInvalidTo.includes("01/05/2027"));
    assert.ok(!htmlInvalidTo.includes("NaN"));
  });

  test("ADV-DRP.4: Non-Date Type Injection into value props", () => {
    const invalidValues = [
      { from: "not a date" },
      { from: {} },
      { from: [] },
      { from: null },
      { from: true },
      { from: Symbol.for("date") },
      { from: NaN },
    ];

    for (const val of invalidValues) {
      const html = renderToString(
        React.createElement(DateRangePicker, {
          value: val as any,
          placeholder: "Safe Placeholder",
        })
      );
      assert.ok(
        html.includes("Safe Placeholder"),
        `Expected Safe Placeholder for invalid type: ${typeof val.from}`
      );
    }

    // Timestamp as number is supported by date-fns and should format cleanly without crashing
    const timestampHtml = renderToString(
      React.createElement(DateRangePicker, {
        value: { from: 1700000000000 as any },
      })
    );
    assert.ok(timestampHtml.includes("15/11/2023"));
  });

  test("ADV-DRP.5: Preset Key Adversarial Inputs & Fallback Behavior", () => {
    const now = new Date(2027, 5, 15);
    const adversarialKeys = [
      "",
      "   ",
      "__proto__",
      "constructor",
      "toString",
      "NON_EXISTENT_PRESET",
      "undefined",
      "null",
    ];

    for (const pKey of adversarialKeys) {
      const html = renderToString(
        React.createElement(DateRangePicker, {
          value: { from: now, to: now },
          presetKey: pKey,
        })
      );
      // When unknown presetKey is provided with single date, format should be exact single date
      assert.ok(html.includes("15/06/2027"));
    }
  });

  test("ADV-DRP.6: Fuzzing getDateRangeFromPreset with 50+ Arbitrary Types", () => {
    const fuzzInputs: unknown[] = [
      "today", "7d", "last_7_days", "30d", "last_30_days", "this_month", "90d",
      "this_quarter", "12m", "this_year", "all", "all_time",
      "", " ", "foo", "bar", null, undefined, 0, 1, -1, 1e6,
      {}, { id: "custom" }, [], [1, 2, 3], false, true, NaN, Infinity, -Infinity,
      "__proto__", "constructor", "toString", "valueOf",
      Symbol.for("preset"), () => "today",
    ];

    for (const input of fuzzInputs) {
      const range = getDateRangeFromPreset(input as any);
      assert.ok(range, `Range must be returned for input: ${String(input)}`);
      assert.ok(isValid(range.from), `range.from must be valid for ${String(input)}`);
      assert.ok(isValid(range.to), `range.to must be valid for ${String(input)}`);
      assert.ok(
        range.from.getTime() <= range.to.getTime(),
        `range.from must be <= range.to for ${String(input)}`
      );
    }
  });

  test("ADV-DRP.7: Visual Variant Integrity with Adversarial Trigger ClassNames", () => {
    const variants: Array<"glass" | "outline" | "default"> = ["glass", "outline", "default"];
    for (const variant of variants) {
      const html = renderToString(
        React.createElement(DateRangePicker, {
          variant,
          triggerClassName: "p-4 text-red-500 <script>alert(1)</script>",
        })
      );
      assert.ok(html.includes("id=\"date-range-picker-trigger\""));
      assert.ok(html.includes("p-4 text-red-500"));
      // Assert script tag is safely HTML-escaped by React
      assert.ok(!html.includes("<script>alert(1)</script>"));
    }
  });
});

// ============================================================================
// SUITE 2: ChartContainer & Chart Components Adversarial Hardening
// ============================================================================
describe("Adversarial Suite 2: ChartContainer & Chart Hardening", () => {
  test("ADV-CHT.1: Radical Non-Object & Nullish Configs", () => {
    const radicalConfigs = [
      "non-object-string",
      123456,
      true,
      false,
      [],
      [1, 2, 3],
      Object.create(null),
      { __proto__: null },
      { views: null },
      { views: undefined },
      { views: "string-value" },
      { views: { color: undefined, theme: undefined } },
      { views: { theme: null } },
      { views: { theme: "invalid-string" } },
    ];

    for (const config of radicalConfigs) {
      const html = renderToString(
        React.createElement(ChartContainer as any, {
          config: config as any,
          children: React.createElement("div", { id: "child" }, "Child Graphic"),
        })
      );
      assert.ok(html.includes("data-slot=\"chart\""));
    }
  });

  test("ADV-CHT.2: ChartStyle Injection & CSS Syntax Resilience", () => {
    const injectionConfig: any = {
      "metric</style><script>": { color: "#ff0000" },
      "metric.with.dots": { color: "#00ff00" },
      "metric-with-dashes": { theme: { light: "#000", dark: "#fff" } },
    };

    const html = renderToString(
      React.createElement(ChartStyle, {
        id: "adv-chart-test",
        config: injectionConfig,
      })
    );
    assert.ok(html.includes("[data-chart=adv-chart-test]"));
    assert.ok(html.includes("--color-metric-with-dashes: #000;"));
    assert.ok(html.includes(".dark [data-chart=adv-chart-test]"));
  });

  test("ADV-CHT.3: Malformed, Null, and Infinite Values in Tooltip Payloads", () => {
    const maliciousPayloads = [
      [],
      [{ value: 100 }],
      [{ dataKey: "v", value: "NotANumber" }],
      [{ dataKey: "v", value: false }],
      [{ dataKey: "v", value: null }],
      [{ dataKey: "v", value: undefined }],
      [{ dataKey: "v", value: NaN }],
      [{ dataKey: "v", value: Infinity }],
      [{ dataKey: "v", value: -Infinity }],
      [{ dataKey: "v", value: -123456.789 }],
      [{ payload: { fill: "#123456", v: "CustomNested" }, dataKey: "v", value: 42 }],
      [{ name: "namedMetric", dataKey: "v", value: 10 }],
      [{ name: undefined, dataKey: undefined, value: 99 }],
    ];

    for (const payload of maliciousPayloads) {
      const html = renderToString(
        React.createElement(
          ChartContext.Provider,
          { value: { config: { v: { label: "Test Metric" } } } },
          React.createElement(ChartTooltipContent as any, {
            active: true,
            payload,
          })
        )
      );
      if (payload.length > 0) {
        assert.ok(html.includes("border-border/50"), "Must render container when active with payload");
      }
    }
  });

  test("ADV-CHT.4: Formatter Stress & Return Types in ChartTooltipContent", () => {
    let formatterCallCount = 0;
    const html = renderToString(
      React.createElement(
        ChartContext.Provider,
        { value: { config: { pageviews: { label: "Page Views" } } } },
        React.createElement(ChartTooltipContent as any, {
          active: true,
          payload: [
            { dataKey: "pageviews", value: 1250, name: undefined },
            { name: "explicitName", value: 450, dataKey: undefined },
          ],
          formatter: (value: any, name: any) => {
            formatterCallCount++;
            return React.createElement("div", { className: "custom-formatted" }, `${name}=>${value}`);
          },
        })
      )
    );
    assert.strictEqual(formatterCallCount, 2, "Formatter must be called for both items");
    assert.ok(html.includes("pageviews=&gt;1250"));
    assert.ok(html.includes("explicitName=&gt;450"));
  });

  test("ADV-CHT.5: ChartLegendContent Defensive Checks with Incomplete Items", () => {
    const payload = [
      { value: "views", color: "#2563eb", dataKey: "views" },
      { value: "clicks", color: undefined, dataKey: "clicks" },
      { value: "conversions", color: "#10b981", dataKey: undefined },
      { value: undefined, color: "#f59e0b", dataKey: "unknown" },
    ];

    const html = renderToString(
      React.createElement(
        ChartContext.Provider,
        { value: { config: { views: { label: "Views" } } } },
        React.createElement(ChartLegendContent as any, {
          payload,
        })
      )
    );
    assert.ok(html.includes("Views"));
    assert.ok(html.includes("clicks"));
    assert.ok(html.includes("conversions"));
  });
});

// ============================================================================
// SUITE 3: NumberTicker Adversarial Range & Formatting Resilience
// ============================================================================
describe("Adversarial Suite 3: NumberTicker Adversarial Resilience", () => {
  test("ADV-NT.1: Extreme Numeric Value Ranges", () => {
    const extremeValues = [
      { val: 0, expected: ">0<" },
      { val: -0, expected: ">-0<" },
      { val: 1e12, expected: ">1,000,000,000,000<" },
      { val: -1e12, expected: ">-1,000,000,000,000<" },
      { val: Number.MAX_SAFE_INTEGER, expected: ">9,007,199,254,740,991<" },
      { val: Number.MIN_SAFE_INTEGER, expected: ">-9,007,199,254,740,991<" },
    ];

    for (const { val, expected } of extremeValues) {
      const html = renderToString(React.createElement(NumberTicker, { value: val }));
      assert.ok(html.includes(expected), `Expected ${expected} for value ${val}`);
    }
  });

  test("ADV-NT.2: Out-of-Bounds, Negative, Fractional, and Non-Integer Decimal Places Clamping", () => {
    const decimalTestCases = [
      { dec: -100, val: 42, expected: ">42<" },
      { dec: -1, val: 42, expected: ">42<" },
      { dec: 0, val: 42, expected: ">42<" },
      { dec: 0.8, val: 42, expected: ">42<" }, // floor(0.8) = 0
      { dec: 2.9, val: 42, expected: ">42.00<" }, // floor(2.9) = 2
      { dec: 20, val: 1, expected: "1.00000000000000000000" }, // 20 decimals
      { dec: 21, val: 1, expected: "1.00000000000000000000" }, // clamped to 20
      { dec: 9999, val: 1, expected: "1.00000000000000000000" }, // clamped to 20
      { dec: null, val: 42, expected: ">42<" },
      { dec: undefined, val: 42, expected: ">42<" },
      { dec: NaN, val: 42, expected: ">42<" },
      { dec: Infinity, val: 1, expected: "1.00000000000000000000" }, // clamped to 20
      { dec: -Infinity, val: 42, expected: ">42<" }, // clamped to 0
    ];

    for (const { dec, val, expected } of decimalTestCases) {
      const html = renderToString(
        React.createElement(NumberTicker, { value: val, decimalPlaces: dec as any })
      );
      assert.ok(
        html.includes(expected),
        `Failed for decimalPlaces=${dec}: expected to include ${expected}, got ${html}`
      );
    }
  });

  test("ADV-NT.3: Directional Dynamics & Start Values", () => {
    // Direction down
    const htmlDown = renderToString(
      React.createElement(NumberTicker, {
        value: 0,
        startValue: 100,
        direction: "down",
      })
    );
    assert.ok(htmlDown.includes(">0<"));

    // Direction up with negative start
    const htmlUp = renderToString(
      React.createElement(NumberTicker, {
        value: 50,
        startValue: -50,
        direction: "up",
      })
    );
    assert.ok(htmlUp.includes(">50<"));
  });

  test("ADV-NT.4: isEditor Mode and Children Override Precedence", () => {
    // isEditor = true
    const htmlEditor = renderToString(
      React.createElement(NumberTicker, {
        value: 1234.56,
        decimalPlaces: 2,
        isEditor: true,
      })
    );
    assert.ok(htmlEditor.includes(">1,234.56<"));

    // Children override
    const htmlOverride = renderToString(
      React.createElement(
        NumberTicker,
        {
          value: 9999,
          decimalPlaces: 2,
        },
        React.createElement("strong", null, "Custom Value")
      )
    );
    assert.ok(htmlOverride.includes("<strong>Custom Value</strong>"));
    assert.ok(!htmlOverride.includes("9,999.00"));
  });

  test("ADV-NT.5: Non-Finite Values (NaN, Infinity, -Infinity)", () => {
    const nonFiniteValues = [
      { val: NaN, expected: "NaN" },
      { val: Infinity, expected: "∞" },
      { val: -Infinity, expected: "-∞" },
    ];

    for (const { val, expected } of nonFiniteValues) {
      const html = renderToString(React.createElement(NumberTicker, { value: val }));
      assert.ok(html.includes(expected), `Expected ${expected} for non-finite value ${val}`);
    }
  });
});

// ============================================================================
// SUITE 4: Regression Prevention & Clean Code Verification
// ============================================================================
describe("Adversarial Suite 4: Clean Code & Defect Resolution Verification", () => {
  test("ADV-REG.1: Verify Zero Sparkle Icons Across UI Primitives", () => {
    // Render each component and inspect HTML output
    const drpHtml = renderToString(React.createElement(DateRangePicker, {}));
    const chartHtml = renderToString(
      React.createElement(ChartContainer, {
        config: {},
        children: React.createElement("div", null, "content"),
      })
    );
    const tickerHtml = renderToString(React.createElement(NumberTicker, { value: 10 }));

    for (const [name, html] of [
      ["DateRangePicker", drpHtml],
      ["ChartContainer", chartHtml],
      ["NumberTicker", tickerHtml],
    ]) {
      assert.ok(
        !html.toLowerCase().includes("sparkle"),
        `${name} must not contain any sparkle icons`
      );
    }
  });

  test("ADV-REG.2: Verify Zero Unnecessary English Parenthetical Subtitles in DateRangePicker", () => {
    const drpHtml = renderToString(
      React.createElement(DateRangePicker, {
        placeholder: "Select date range",
      })
    );
    // Ensure "(select end date)" is permanently banished
    assert.ok(!drpHtml.includes("(select end date)"));
    // Ensure no other English subtitle in () appears
    assert.ok(!/\([a-zA-Z ]+\)/.test(drpHtml));
  });

  test("ADV-REG.3: Verification of Resolution for All 4 Defect Vectors", () => {
    // Defect Vector 1: DateRangePicker invalid Date RangeError
    assert.doesNotThrow(() => {
      renderToString(
        React.createElement(DateRangePicker, {
          value: { from: new Date("invalid"), to: new Date(NaN) },
        })
      );
    }, "Defect Vector 1 must not throw RangeError");

    // Defect Vector 2: ChartContainer undefined / null config TypeError
    assert.doesNotThrow(() => {
      renderToString(
        React.createElement(ChartContainer as any, {
          config: undefined,
          children: React.createElement("div", null, "test"),
        })
      );
      renderToString(
        React.createElement(ChartContainer as any, {
          config: null,
          children: React.createElement("div", null, "test"),
        })
      );
    }, "Defect Vector 2 must not throw TypeError");

    // Defect Vector 3: NumberTicker negative/extreme decimalPlaces RangeError
    assert.doesNotThrow(() => {
      renderToString(
        React.createElement(NumberTicker, { value: 100, decimalPlaces: -5 })
      );
      renderToString(
        React.createElement(NumberTicker, { value: 100, decimalPlaces: 999 })
      );
    }, "Defect Vector 3 must not throw RangeError");

    // Defect Vector 4: Global rules (No sparkle icons, no English in parentheses)
    const combinedHtml = renderToString(
      React.createElement(
        "div",
        null,
        React.createElement(DateRangePicker, {}),
        React.createElement(NumberTicker, { value: 100 })
      )
    );
    assert.ok(!combinedHtml.toLowerCase().includes("sparkle"));
    assert.ok(!combinedHtml.includes("(select end date)"));
  });
});
