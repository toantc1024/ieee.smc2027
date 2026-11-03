# Investigation & Hardening Report: NumberTicker UI Primitive (`src/components/ui/number-ticker.tsx`)

## 1. Observation

### Current File Inspection: `src/components/ui/number-ticker.tsx`
- **Component signature and props (Lines 7–25)**:
  ```tsx
  export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
    value: number;
    startValue?: number;
    direction?: "up" | "down";
    delay?: number;
    decimalPlaces?: number;
    isEditor?: boolean;
  }
  ```
- **Vulnerable Call-site 1: Editor mode direct format (Lines 37–40)**:
  ```tsx
  ref.current.textContent = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
  ```
- **Vulnerable Call-site 2: Spring change listener (Lines 56–60)**:
  ```tsx
  ref.current.textContent = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(latest.toFixed(decimalPlaces)));
  ```
- **Vulnerable Call-site 3: Initial SSR fallback render (Lines 75–78)**:
  ```tsx
  {props.children ??
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(value)}
  ```

### Verbatim Runtime Errors on Negative / Invalid Decimal Places
- Passing negative `decimalPlaces` (e.g., `decimalPlaces={-1}`):
  ```
  RangeError: minimumFractionDigits value is out of range.
      at new NumberFormat (<anonymous>)
      at NumberTicker (src/components/ui/number-ticker.tsx:75:10)
  ```
- Passing `latest.toFixed(decimalPlaces)` with negative value:
  ```
  RangeError: toFixed() digits argument must be between 0 and 100
  ```
- Passing `decimalPlaces > 20` (e.g., `decimalPlaces={25}`):
  ```
  RangeError: minimumFractionDigits value is out of range.
  ```

### Empirical Test Harness: `tests/primitives/ui-primitives.stress.test.ts`
- Line 438 currently reproduces the crash via:
  ```ts
  test("P4.5 [FAIL EXPECTED / BUG]: NumberTicker crashes with RangeError when decimalPlaces is negative", () => {
    let caught: any = null;
    try {
      renderToString(React.createElement(NumberTicker, { value: 50, decimalPlaces: -1 }));
    } catch (err) {
      caught = err;
    }
    assert.ok(caught !== null, "Expected negative decimalPlaces to throw error");
    assert.strictEqual(caught.name, "RangeError");
    assert.ok(caught.message.includes("out of range"));
  });
  ```
- Running `npx tsx --test tests/primitives/ui-primitives.stress.test.ts` confirms 34 tests passing, where P4.5 passes by asserting that the component crashes.

### Icon & User Rule Inspection
- Checked `src/components/ui/number-ticker.tsx`: 0 icons imported or used.
- Checked `src/components/ui/`: Zero sparkle icons exist.
- Verified rule compliance: No sparkle icons (`Sparkles`, `Sparkle`, or sparkle glyphs) present.
- Verified subtitle rule: No unnecessary English text in parentheses `()` is added.

---

## 2. Logic Chain

1. **Root Cause**:
   - `Intl.NumberFormat` options `minimumFractionDigits` and `maximumFractionDigits` are constrained by the ECMA-402 specification to integer values in the range `[0, 20]`.
   - `Number.prototype.toFixed(digits)` requires an integer in the range `[0, 100]`.
   - In dynamic UI contexts (e.g. calculated metrics in analytics dashboards or user-edited builder properties), `decimalPlaces` can be passed as negative numbers (`-1`), non-integers (`2.5`), excessive values (`50`), `NaN`, `null`, or `undefined`.
   - When unconstrained, passing any out-of-range value directly to `Intl.NumberFormat` throws an unhandled `RangeError`, which crashes React during SSR or client render.

2. **Clamping Invariant**:
   - The formula `Math.max(0, Math.min(20, Math.floor(decimalPlaces || 0)))` establishes the following mathematical guarantees:
     - If `decimalPlaces` is falsy (`undefined`, `null`, `NaN`, `0`), `decimalPlaces || 0` is `0`, `Math.floor(0)` is `0`, clamped to `0`.
     - If `decimalPlaces` is negative (e.g., `-1`, `-5`), `Math.max(0, ...)` guarantees a minimum of `0`.
     - If `decimalPlaces` is non-integer (e.g., `2.7`), `Math.floor(2.7)` produces integer `2`.
     - If `decimalPlaces` is excessively large (e.g., `99`), `Math.min(20, ...)` caps the value at `20`.
   - Verified via Node runtime:
     - `input: -5` -> `safe: 0`, format output: `"42"`, `toFixed`: `"42"`
     - `input: -1` -> `safe: 0`, format output: `"42"`, `toFixed`: `"42"`
     - `input: 0` -> `safe: 0`, format output: `"42"`, `toFixed`: `"42"`
     - `input: 1` -> `safe: 1`, format output: `"42.1"`, `toFixed`: `"42.1"`
     - `input: 2.7` -> `safe: 2`, format output: `"42.12"`, `toFixed`: `"42.12"`
     - `input: 25` -> `safe: 20`, format output: `"42.12345600000000000000"`, `toFixed`: `"42.12345599999999734564"`
     - `input: undefined` -> `safe: 0`, format output: `"42"`, `toFixed`: `"42"`
     - `input: null` -> `safe: 0`, format output: `"42"`, `toFixed`: `"42"`
     - `input: NaN` -> `safe: 0`, format output: `"42"`, `toFixed`: `"42"`

3. **Complete Surface Hardening**:
   - Defining `const safeDecimals = Math.max(0, Math.min(20, Math.floor(decimalPlaces || 0)));` at the top of `NumberTicker` ensures all 3 call sites (`isEditor`, `springValue.on("change")`, and SSR render) use the hardened value.
   - Updating the dependency arrays of both `useEffect` hooks from `decimalPlaces` to `safeDecimals` avoids stale closures or redundant re-subscriptions if decimal precision fluctuates within sub-integer deltas.

4. **Test Suite Adaptation Requirement**:
   - Because test P4.5 in `tests/primitives/ui-primitives.stress.test.ts` was written to catch the pre-fix bug (`caught.name === "RangeError"`), applying the fix will make P4.5 fail unless P4.5 is updated to assert the hardened behavior (rendering `>50<` safely).

---

## 3. Caveats

- **Animation Framework**: `NumberTicker` relies on `motion/react` (`useSpring`, `useMotionValue`). In Node/SSR test environments, spring changes are not executed over real time; however, static formatting, SSR initial HTML, editor bypass, and error boundaries are fully verifiable in Node.
- **Sparkle Icon Audit**: Verified that no sparkle icons exist in `src/components/ui/number-ticker.tsx` or in `src/components/ui/`. A comment mentioning sparkles exists in `src/app/not-found.tsx` (line 21), but no icon component is imported or rendered.

---

## 4. Conclusion & Concrete Hardening Plan

### Artifacts Prepared in Working Directory
1. **Replacement File**: `.agents/teamwork/explorer_m0_r2_3/proposed_number-ticker.tsx`
2. **Unified Diff Patch**: `.agents/teamwork/explorer_m0_r2_3/number-ticker.patch`

### Implementation Strategy for Worker M0

#### File 1: `src/components/ui/number-ticker.tsx`
Apply the following diff:

```diff
--- a/src/components/ui/number-ticker.tsx
+++ b/src/components/ui/number-ticker.tsx
@@ -25,6 +25,7 @@ export function NumberTicker({
 }: NumberTickerProps) {
   const ref = useRef<HTMLSpanElement>(null);
+  const safeDecimals = Math.max(0, Math.min(20, Math.floor(decimalPlaces || 0)));
   const motionValue = useMotionValue(direction === "down" ? value : startValue);
   const springValue = useSpring(motionValue, {
     damping: 60,
@@ -37,8 +38,8 @@ export function NumberTicker({
   useEffect(() => {
     if (isEditor && ref.current) {
       ref.current.textContent = Intl.NumberFormat("en-US", {
-        minimumFractionDigits: decimalPlaces,
-        maximumFractionDigits: decimalPlaces,
+        minimumFractionDigits: safeDecimals,
+        maximumFractionDigits: safeDecimals,
       }).format(value);
       return;
     }
@@ -49,19 +50,19 @@ export function NumberTicker({
       }, delay * 1000);
       return () => clearTimeout(timer);
     }
-  }, [motionValue, isInView, delay, value, direction, startValue, isEditor, decimalPlaces]);
+  }, [motionValue, isInView, delay, value, direction, startValue, isEditor, safeDecimals]);
 
   useEffect(
     () =>
       springValue.on("change", (latest) => {
         if (ref.current) {
           ref.current.textContent = Intl.NumberFormat("en-US", {
-            minimumFractionDigits: decimalPlaces,
-            maximumFractionDigits: decimalPlaces,
-          }).format(Number(latest.toFixed(decimalPlaces)));
+            minimumFractionDigits: safeDecimals,
+            maximumFractionDigits: safeDecimals,
+          }).format(Number(latest.toFixed(safeDecimals)));
         }
       }),
-    [springValue, decimalPlaces]
+    [springValue, safeDecimals]
   );
 
   return (
@@ -75,8 +76,8 @@ export function NumberTicker({
     >
       {props.children ??
         Intl.NumberFormat("en-US", {
-          minimumFractionDigits: decimalPlaces,
-          maximumFractionDigits: decimalPlaces,
+          minimumFractionDigits: safeDecimals,
+          maximumFractionDigits: safeDecimals,
         }).format(value)}
     </span>
   );
```

#### File 2: Update Stress Test `tests/primitives/ui-primitives.stress.test.ts`
Replace lines 438–451 with:
```ts
  test("P4.5: NumberTicker clamps negative and excessive decimalPlaces safely without RangeError", () => {
    const htmlNegativeDec = renderToString(
      React.createElement(NumberTicker, { value: 50, decimalPlaces: -1 })
    );
    assert.ok(htmlNegativeDec.includes(">50<"));

    const htmlExcessiveDec = renderToString(
      React.createElement(NumberTicker, { value: 50, decimalPlaces: 99 })
    );
    assert.ok(htmlExcessiveDec.includes("50.00000000000000000000"));
  });
```

---

## 5. Verification Method

To verify after implementation:

1. **Apply the patch or replacement**:
   ```bash
   patch src/components/ui/number-ticker.tsx < .agents/teamwork/explorer_m0_r2_3/number-ticker.patch
   ```
2. **Execute the empirical stress test**:
   ```bash
   npx tsx --test tests/primitives/ui-primitives.stress.test.ts
   ```
   *Expected outcome*: 34 tests pass, including suite 4 tests without any RangeError thrown.
3. **Run TypeScript check**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *Expected outcome*: Exits with code 0.
4. **Run build check**:
   ```bash
   pnpm run build
   ```
   *Expected outcome*: Production build completes with zero errors.
5. **Sparkle icon check**:
   ```bash
   git grep -i "sparkle" src/components/ui/number-ticker.tsx
   ```
   *Expected outcome*: Zero matches.
