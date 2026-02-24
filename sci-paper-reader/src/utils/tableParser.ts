/**
 * Utility for parsing tab-delimited and pipe-delimited table data from text.
 */

/**
 * Parses tab-delimited or pipe-delimited text into table headers and rows.
 *
 * Scans body text for consecutive delimited lines and groups them into tables.
 * Markdown separator rows (e.g. `| --- | --- |`) are skipped.
 *
 * @param text - The body text to scan for table data.
 * @returns An array of parsed tables, each with headers and rows arrays.
 */
export function parseTablesFromText(
  text: string
): Array<{ headers: string[]; rows: string[][] }> {
  const lines = text.split('\n');
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const isDelimitedRow = (line: string) =>
    line.includes('\t') || (line.includes('|') && line.trim().startsWith('|'));

  const parseLine = (line: string): string[] => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) {
      return trimmed
        .split('|')
        .filter((_, i, arr) => i > 0 && i < arr.length - 1)
        .map((c) => c.trim());
    }
    return trimmed.split('\t').map((c) => c.trim());
  };

  const isSeparatorRow = (cells: string[]) =>
    cells.every((c) => /^[-:]+$/.test(c.trim()));

  for (const line of lines) {
    if (isDelimitedRow(line)) {
      const cells = parseLine(line);
      if (cells.length < 2) continue;

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else if (isSeparatorRow(cells)) {
        // Markdown table separator — skip
        continue;
      } else {
        currentTable.rows.push(cells);
      }
    } else {
      if (currentTable && currentTable.rows.length > 0) {
        tables.push(currentTable);
      }
      currentTable = null;
    }
  }

  if (currentTable && currentTable.rows.length > 0) {
    tables.push(currentTable);
  }

  return tables;
}
