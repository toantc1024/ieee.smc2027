import katex from "katex";

/** Serialize KaTeX as native MathML so saved post HTML renders without client hydration. */
export function publicMath(formula: string, displayMode: boolean): HTMLElement {
  const element = document.createElement("span");
  element.innerHTML = katex.renderToString(formula, { output: "mathml", displayMode, throwOnError: false, trust: false });
  return element;
}
