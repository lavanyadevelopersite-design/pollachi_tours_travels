export const exportToCsv = (rows = [], columns = [], filename = 'export') => {
  const headers = columns.map((c) => c.name || c.label || c.key).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const key = col.selectorKey || col.key || col.id;
          let val = typeof col.selector === 'function' ? col.selector(row) : row[key];
          if (val === null || val === undefined) val = '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = (rows, columns, filename) => {
  // CSV is widely compatible; rename as .xls for simple Excel open
  const headers = columns.map((c) => c.name || c.label || c.key).join('\t');
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const key = col.selectorKey || col.key || col.id;
          const val = typeof col.selector === 'function' ? col.selector(row) : row[key];
          return val ?? '';
        })
        .join('\t')
    )
    .join('\n');

  const blob = new Blob([`${headers}\n${body}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};

export const printTable = (title = 'Report') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head><title>${title}</title>
      <style>
        body { font-family: Public Sans, sans-serif; padding: 24px; }
        h1 { font-size: 18px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f4f7fa; }
      </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${document.querySelector('.rdt_Table')?.outerHTML || '<p>No data</p>'}
        <script>window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const exportToPdfStub = (title) => {
  printTable(title);
};
