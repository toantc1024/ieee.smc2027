import test from "node:test";
import assert from "node:assert/strict";
import { publicChart } from "../../src/components/admin/tiptap/hcmute/public-chart";
import { publicMath } from "../../src/components/admin/tiptap/hcmute/public-math";

class TestElement {
  attributes: Record<string, string> = {};
  children: TestElement[] = [];
  textContent = "";
  innerHTML = "";
  constructor(public tagName: string) {}
  setAttribute(name: string, value: string) { this.attributes[name] = value; }
  appendChild(child: TestElement) { this.children.push(child); }
}

function withDocument(fn: () => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    createElement: (tag: string) => new TestElement(tag),
    createElementNS: (_namespace: string, tag: string) => new TestElement(tag),
  } });
  try { fn(); } finally {
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else Reflect.deleteProperty(globalThis, "document");
  }
}

test("public charts use the real values and render each supported chart type", () => withDocument(() => {
  const data = JSON.stringify([{ name: "First", value: 2 }, { name: "Second", value: 5 }]);
  for (const [type, element] of [["bar", "rect"], ["line", "path"], ["area", "path"], ["pie", "path"], ["radar", "polygon"]]) {
    const svg = publicChart(data, type, "{}") as unknown as TestElement;
    assert.ok(svg.children.some((child) => child.tagName === element), type);
    assert.ok(svg.children.some((child) => child.textContent.includes("First")), type);
  }
  const empty = publicChart("invalid", "bar", "{}") as unknown as TestElement;
  assert.equal(empty.children[0].textContent, "No chart data");
}));

test("public equations produce MathML without trusting dangerous LaTeX links", () => withDocument(() => {
  const math = publicMath("\\frac{x}{2}", true) as unknown as TestElement;
  assert.match(math.innerHTML, /<math/);
  assert.match(math.innerHTML, /<mfrac>/);
  const unsafe = publicMath("\\href{javascript:alert(1)}{click}", false) as unknown as TestElement;
  assert.doesNotMatch(unsafe.innerHTML, /href="javascript:/i);
}));
