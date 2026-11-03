# Handoff Report: DateRangePicker Hardening Strategy (Milestone M0-R2-1)

**Target Component**: `src/components/ui/date-range-picker.tsx`  
**Patch Artifact**: `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_1/date-range-picker.patch`  
**Replacement Artifact**: `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_1/proposed_date-range-picker.tsx`  
**Status**: Complete & Empirically Verified  

---

## 1. Observation

### 1.1 Direct Code Observations & Verbatim Errors in `src/components/ui/date-range-picker.tsx`

1. **`displayLabel` Memo (Lines 169–178)**:
   ```ts
   169: const displayLabel = React.useMemo(() => {
   170:   if (!value?.from) {
   171:     return placeholder;
   172:   }
   173:   const fromStr = format(value.from, "dd/MM/yyyy");
   174:   if (!value.to || value.from.getTime() === value.to.getTime()) {
   175:     return fromStr;
   176:   }
   177:   const toDate = value.to;
   178:   const toStr = format(toDate, "dd/MM/yyyy");
   ```
   - **Invalid `value.from`**: When `value = { from: new Date("invalid") }` or `value = { from: new Date(NaN) }`, `!value?.from` evaluates to `false` because the invalid Date is a truthy object. `format(value.from, "dd/MM/yyyy")` is invoked directly.
     - **Verbatim Error**: `RangeError: Invalid time value` at `format (date-fns/format.cjs:359:11)`
   - **Invalid `value.to`**: When `value = { from: new Date(2027, 0, 1), to: new Date(NaN) }`, `!value.to` is `false`, `value.from.getTime() === value.to.getTime()` evaluates to `false` (since `1798761600000 === NaN` is false), and `format(toDate, "dd/MM/yyyy")` at line 178 is executed.
     - **Verbatim Error**: `RangeError: Invalid time value` at `format (date-fns/format.cjs:359:11)`

2. **`fullRangeTitle` Memo (Lines 205–210)**:
   ```ts
   205: const fullRangeTitle = React.useMemo(() => {
   206:   if (!value?.from) return undefined;
   207:   const fromStr = format(value.from, "dd/MM/yyyy");
   208:   const toStr = value.to ? format(value.to, "dd/MM/yyyy") : fromStr;
   209:   return `${fromStr} - ${toStr}`;
   210: }, [value]);
   ```
   - When `value.from` is invalid, line 207 crashes with `RangeError: Invalid time value`.
   - When `value.to` is invalid, `value.to` is truthy, so line 208 evaluates `format(value.to, "dd/MM/yyyy")` and crashes with `RangeError: Invalid time value`.

3. **`defaultMonth` in DayPicker / Calendar (Line 311)**:
   ```ts
   311: defaultMonth={draftRange?.from || value?.from || new Date()}
   ```
   - If `value.from` is an invalid Date, `draftRange?.from || value?.from` passes `new Date("invalid")` directly to `Calendar` (`react-day-picker`).
   - Testing `DayPicker` with `defaultMonth={new Date("invalid")}` yields:
     - **Verbatim Error**: `RangeError: Invalid time value` at `DateLib.formatMonthYear` (`react-day-picker/dist/cjs/classes/DateLib.js:545:21`)

4. **Apply Button & `handleApply` (Lines 136–138, 352)**:
   ```ts
   136: if (draftRange?.from) {
   137:   const from = startOfDay(draftRange.from);
   138:   const to = endOfDay(draftRange.to || draftRange.from);
   ...
   352: disabled={!draftRange?.from}
   ```
   - When `draftRange.from` is an invalid Date, `!draftRange?.from` evaluates to `false` (Apply button is active). Clicking Apply sends corrupted `Date(NaN)` values through `onChange`.

5. **User Rules & Style Checks**:
   - **Sparkle Icons**: Searched `src/components/ui/date-range-picker.tsx` for `sparkle` / `sparkles`. Zero matches found. Icons imported are strictly: `Calendar as CalendarIcon`, `ChevronDown`, `Clock3`, `RotateCcw`, `Check`.
   - **Parenthetical English Subtitle**: Line 331 contains `(select end date)` inside `From {format(draftRange.from, "dd/MM/yyyy")} (select end date)`. Removing `(select end date)` complies with rule *"Do not make too much text or english as sub in () bracelet, no need"*.

---

## 2. Logic Chain

1. **Root Cause**:
   - In JavaScript, `new Date("invalid")` and `new Date(NaN)` instantiate valid `Date` objects whose internal time representation is `NaN`.
   - Boolean checks `if (!date)` pass because the object reference is truthy.
   - Any invocation of `date-fns` `format()`, `.getTime()` comparisons against finite timestamps, or DayPicker calendar calculations throw `RangeError: Invalid time value`.

2. **Resolution Strategy**:
   - **Step 1 (Input Guard in `displayLabel`)**:
     Check `if (!value?.from || !isValid(value.from)) return placeholder;`.
     Sanitize `toDate`: `const toDate = value.to && isValid(value.to) ? value.to : undefined;`.
     If `toDate` is missing or equal to `from`, immediately return `fromStr`.
     Because `from` is guaranteed valid and `toDate` is either undefined or guaranteed valid, preset formatters (`dd/MM`) and range strings (`fromStr - toStr`) will never encounter an invalid Date.
   - **Step 2 (Input Guard in `fullRangeTitle`)**:
     Check `if (!value?.from || !isValid(value.from)) return undefined;`.
     Only format `value.to` if `value.to && isValid(value.to)`; otherwise fall back to `fromStr`.
   - **Step 3 (Internal State Sanitization)**:
     Create `sanitizeRange(range)` helper:
     ```ts
     const sanitizeRange = React.useCallback((range?: { from?: Date; to?: Date }): DateRange | undefined => {
       if (!range?.from || !isValid(range.from)) return undefined;
       const safeTo = range.to && isValid(range.to) ? range.to : undefined;
       return { from: range.from, to: safeTo };
     }, []);
     ```
     Use `sanitizeRange` in `useState` and `useEffect`.
   - **Step 4 (Calendar & Action Guards)**:
     Calculate `defaultMonth` using `isValid`:
     ```ts
     const defaultMonth = React.useMemo(() => {
       if (draftRange?.from && isValid(draftRange.from)) return draftRange.from;
       if (value?.from && isValid(value.from)) return value.from;
       return new Date();
     }, [draftRange?.from, value?.from]);
     ```
     Disable Apply button: `disabled={!draftRange?.from || !isValid(draftRange.from)}`.
     In `handleApply`, fall back to `draftRange.from` if `draftRange.to` is invalid.
   - **Step 5 (Style & Rule Compliance)**:
     Trigger styling check: `const hasValidValue = Boolean(value?.from && isValid(value.from));` ensuring proper muted styling when `value.from` is invalid.
     Footer text: change `From {format(draftRange.from, "dd/MM/yyyy")} (select end date)` to `From {format(draftRange.from, "dd/MM/yyyy")}`.

---

## 3. Caveats

1. **Upstream Callers Responsibility**:
   While `DateRangePicker` now guarantees immunity to invalid Date objects without throwing runtime exceptions, callers should still validate date strings before constructing Date objects where possible.
2. **Preset Keys**:
   Presets (`7d`, `30d`, etc.) construct dates internally via `getDateRangeFromPreset()` which already uses valid timestamps (`Date.now()`); preset generation was already crash-free.

---

## 4. Conclusion & Required Code Changes

Worker M0 can apply either the patch file or the code snippet below to `src/components/ui/date-range-picker.tsx`:

### Diff Patch Snippet

```diff
--- src/components/ui/date-range-picker.tsx
+++ src/components/ui/date-range-picker.tsx
@@ -126,17 +126,27 @@
   const [open, setOpen] = React.useState(false);
-  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
-    value ? { from: value.from, to: value.to } : undefined,
+
+  const sanitizeRange = React.useCallback(
+    (range?: { from?: Date; to?: Date }): DateRange | undefined => {
+      if (!range?.from || !isValid(range.from)) return undefined;
+      const safeTo = range.to && isValid(range.to) ? range.to : undefined;
+      return { from: range.from, to: safeTo };
+    },
+    [],
   );
 
+  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(() =>
+    sanitizeRange(value),
+  );
+
   React.useEffect(() => {
-    setDraftRange(value ? { from: value.from, to: value.to } : undefined);
-  }, [value, open]);
+    setDraftRange(sanitizeRange(value));
+  }, [value, open, sanitizeRange]);
 
   const handleApply = () => {
-    if (draftRange?.from) {
+    if (draftRange?.from && isValid(draftRange.from)) {
       const from = startOfDay(draftRange.from);
-      const to = endOfDay(draftRange.to || draftRange.from);
+      const safeTo = draftRange.to && isValid(draftRange.to) ? draftRange.to : draftRange.from;
+      const to = endOfDay(safeTo);
       onChange?.({ from, to });
       if (onPresetChange) {
         onPresetChange("custom");
@@ -169,13 +179,13 @@
   const displayLabel = React.useMemo(() => {
-    if (!value?.from) {
+    if (!value?.from || !isValid(value.from)) {
       return placeholder;
     }
     const fromStr = format(value.from, "dd/MM/yyyy");
-    if (!value.to || value.from.getTime() === value.to.getTime()) {
+    const toDate = value.to && isValid(value.to) ? value.to : undefined;
+    if (!toDate || value.from.getTime() === toDate.getTime()) {
       return fromStr;
     }
-    const toDate = value.to;
     const toStr = format(toDate, "dd/MM/yyyy");
 
     if (presetKey === "all" || presetKey === "all_time") {
@@ -205,8 +215,15 @@
   const fullRangeTitle = React.useMemo(() => {
-    if (!value?.from) return undefined;
+    if (!value?.from || !isValid(value.from)) return undefined;
     const fromStr = format(value.from, "dd/MM/yyyy");
-    const toStr = value.to ? format(value.to, "dd/MM/yyyy") : fromStr;
+    const toStr = value.to && isValid(value.to) ? format(value.to, "dd/MM/yyyy") : fromStr;
     return `${fromStr} - ${toStr}`;
   }, [value]);
 
+  const defaultMonth = React.useMemo(() => {
+    if (draftRange?.from && isValid(draftRange.from)) return draftRange.from;
+    if (value?.from && isValid(value.from)) return value.from;
+    return new Date();
+  }, [draftRange?.from, value?.from]);
+
   const isGlass = variant === "glass";
+  const hasValidValue = Boolean(value?.from && isValid(value.from));
 
   return (
@@ -226,3 +243,3 @@
-              !value?.from && (isGlass ? "text-white/80" : "text-muted-foreground"),
+              !hasValidValue && (isGlass ? "text-white/80" : "text-muted-foreground"),
               triggerClassName,
             )}
@@ -311,3 +328,3 @@
                   mode="range"
-                  defaultMonth={draftRange?.from || value?.from || new Date()}
+                  defaultMonth={defaultMonth}
                   selected={draftRange}
@@ -330,3 +347,3 @@
                       <span>
-                        From {format(draftRange.from, "dd/MM/yyyy")} (select end date)
+                        From {format(draftRange.from, "dd/MM/yyyy")}
                       </span>
@@ -352,3 +369,3 @@
                     size="sm"
-                    disabled={!draftRange?.from}
+                    disabled={!draftRange?.from || !isValid(draftRange.from)}
                     onClick={handleApply}
```

---

## 5. Verification Method

### 5.1 Verification Commands

1. **Verify Proposed Implementation against Stress Cases**:
   ```bash
   npx tsx -e '
   import * as React from "react";
   import { renderToString } from "react-dom/server";
   import { DateRangePicker } from "./.agents/teamwork/explorer_m0_r2_1/proposed_date-range-picker";
   import assert from "node:assert/strict";

   // 1. Invalid from Date falls back to placeholder without throwing
   const h1 = renderToString(React.createElement(DateRangePicker, { value: { from: new Date("invalid") } }));
   assert.ok(h1.includes("Select date range"));

   // 2. Invalid to Date falls back to single date without throwing
   const h2 = renderToString(React.createElement(DateRangePicker, { value: { from: new Date(2027, 0, 1), to: new Date(NaN) } }));
   assert.ok(h2.includes("01/01/2027"));

   // 3. Valid range renders correctly
   const h3 = renderToString(React.createElement(DateRangePicker, { value: { from: new Date(2027, 0, 1), to: new Date(2027, 0, 5) } }));
   assert.ok(h3.includes("01/01/2027 - 05/01/2027"));

   console.log("All DateRangePicker hardening tests PASSED!");
   '
   ```

2. **Run Stress Test Suite (after Worker M0 applies patch and updates test assertions)**:
   ```bash
   npx tsx --test tests/primitives/ui-primitives.stress.test.ts
   ```
   *Expected*: 34 passed, 0 failed, 6 suites.

3. **Type Check**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *Expected*: Exits with code 0.

4. **Verify Zero Sparkles**:
   ```bash
   grep -i "sparkle" src/components/ui/date-range-picker.tsx
   ```
   *Expected*: Zero output.
