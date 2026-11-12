const SVG = "http://www.w3.org/2000/svg";
const COLORS = ["#4285f4", "#34a853", "#fbbc04", "#ea4335", "#8b5cf6"];

/** Build a self-contained SVG for the HTML article renderer. */
export function publicChart(rawData: unknown, chartType: unknown, rawConfig: unknown): SVGSVGElement {
  let data: Record<string, unknown>[] = [];
  let colors = COLORS;
  try { const value = JSON.parse(String(rawData)); if (Array.isArray(value)) data = value.filter((row) => row && typeof row === "object").slice(0, 80); } catch { /* Invalid saved data remains editable. */ }
  try { const config = JSON.parse(String(rawConfig)); if (Array.isArray(config.colors) && config.colors.length) colors = config.colors.filter((color: unknown) => typeof color === "string" && /^#[0-9a-f]{3,8}$/i.test(color)); } catch { /* Use the default palette. */ }
  if (!colors.length) colors = COLORS;
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 720 340");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${String(chartType || "bar")} chart`);
  svg.setAttribute("style", "display:block;width:100%;height:auto;max-width:720px;margin:auto");
  const add = (tag: string, attrs: Record<string, string | number>, text?: string) => {
    const node = document.createElementNS(SVG, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    svg.appendChild(node);
  };
  const keys = data.length ? Object.keys(data[0]) : [];
  const labelKey = keys[0] || "name";
  const series = keys.slice(1).filter((key) => data.some((row) => Number.isFinite(Number(row[key])))).slice(0, 8);
  if (!data.length || !series.length) { add("text", { x: 360, y: 170, "text-anchor": "middle", fill: "#64748b" }, "No chart data"); return svg; }
  const values = data.flatMap((row) => series.map((key) => Number(row[key]) || 0));
  const max = Math.max(0, ...values) || 1;
  const min = Math.min(0, ...values);
  const y = (value: number) => 265 - ((value - min) / (max - min)) * 225;
  const count = data.length;
  if (chartType === "pie") {
    const pie = data.map((row) => Math.max(0, Number(row[series[0]]) || 0));
    const total = pie.reduce((sum, value) => sum + value, 0);
    let angle = -Math.PI / 2;
    pie.forEach((value, index) => {
      if (!total || !value) return;
      const portion = Math.min((value / total) * Math.PI * 2, Math.PI * 2 - 0.00001);
      const end = angle + portion;
      const x1 = 260 + 118 * Math.cos(angle), y1 = 150 + 118 * Math.sin(angle);
      const x2 = 260 + 118 * Math.cos(end), y2 = 150 + 118 * Math.sin(end);
      add("path", { d: `M260 150 L${x1} ${y1} A118 118 0 ${portion > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`, fill: colors[index % colors.length] });
      if (index < 12) { add("rect", { x: 430, y: 30 + index * 22, width: 10, height: 10, fill: colors[index % colors.length] }); add("text", { x: 446, y: 40 + index * 22, fill: "#334155", "font-size": 12 }, `${String(data[index][labelKey] ?? "")}: ${value}`); }
      angle = end;
    });
  } else if (chartType === "radar") {
    const n = Math.max(count, 3);
    for (let ring = 1; ring <= 4; ring++) {
      const points = Array.from({ length: n }, (_, i) => { const angle = (i * 2 * Math.PI / n) - Math.PI / 2; return `${360 + Math.cos(angle) * 115 * ring / 4},${150 + Math.sin(angle) * 115 * ring / 4}`; }).join(" ");
      add("polygon", { points, fill: "none", stroke: "#cbd5e1" });
    }
    series.forEach((key, s) => {
      const points = data.map((row, i) => { const angle = i * 2 * Math.PI / n - Math.PI / 2; const radius = Math.max(0, Number(row[key]) || 0) / max * 115; return `${360 + Math.cos(angle) * radius},${150 + Math.sin(angle) * radius}`; }).join(" ");
      add("polygon", { points, fill: colors[s % colors.length], "fill-opacity": .22, stroke: colors[s % colors.length], "stroke-width": 2 });
    });
    data.forEach((row, i) => { const angle = i * 2 * Math.PI / n - Math.PI / 2; add("text", { x: 360 + Math.cos(angle) * 135, y: 150 + Math.sin(angle) * 135, "text-anchor": "middle", "font-size": 11, fill: "#334155" }, String(row[labelKey] ?? "")); });
  } else {
    add("line", { x1: 48, y1: y(0), x2: 692, y2: y(0), stroke: "#94a3b8" });
    data.forEach((row, i) => { const x = 48 + (i + .5) * (644 / count); if (count <= 16) add("text", { x, y: 285, "text-anchor": "middle", "font-size": 11, fill: "#475569" }, String(row[labelKey] ?? "")); });
    series.forEach((key, s) => {
      const points = data.map((row, i) => ({ x: 48 + (i + .5) * (644 / count), y: y(Number(row[key]) || 0) }));
      if (chartType === "bar") points.forEach((point) => { const width = Math.max(1, Math.min(50, 644 / count / (series.length + 1))); add("rect", { x: point.x + (s - series.length / 2) * width, y: Math.min(y(0), point.y), width, height: Math.abs(y(0) - point.y), fill: colors[s % colors.length] }); });
      else {
        const path = points.map((point, i) => `${i ? "L" : "M"}${point.x} ${point.y}`).join(" ");
        if (chartType === "area") add("path", { d: `${path} L${points[points.length - 1].x} ${y(0)} L${points[0].x} ${y(0)} Z`, fill: colors[s % colors.length], "fill-opacity": .2 });
        add("path", { d: path, fill: "none", stroke: colors[s % colors.length], "stroke-width": 3 });
      }
    });
  }
  if (chartType !== "pie") series.forEach((key, i) => { const x = 50 + i * 100; add("rect", { x, y: 308, width: 10, height: 10, fill: colors[i % colors.length] }); add("text", { x: x + 15, y: 318, "font-size": 11, fill: "#334155" }, key); });
  return svg;
}
