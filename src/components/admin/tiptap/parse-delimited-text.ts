/** Parse CSV or tab-separated text, including escaped quotes and multiline cells. */
export function parseDelimitedText(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  let quoted = false;
  let commas = 0;
  let tabs = 0;
  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (character === '"') {
      if (quoted && input[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && (character === "\n" || character === "\r")) break;
    else if (!quoted && character === ",") commas++;
    else if (!quoted && character === "\t") tabs++;
  }
  const delimiter = tabs > commas ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  quoted = false;
  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (character === '"' && quoted && input[i + 1] === '"') { cell += '"'; i++; }
    else if (character === '"' && (quoted || cell === "")) quoted = !quoted;
    else if (!quoted && character === delimiter) { row.push(cell); cell = ""; }
    else if (!quoted && (character === "\r" || character === "\n")) {
      if (character === "\r" && input[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("The file contains an unclosed quoted cell.");
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const width = Math.max(...rows.map((item) => item.length));
  return rows.map((item) => [...item, ...Array(width - item.length).fill("")]);
}
