import Papa from 'papaparse';

export function parseCSV(fileBuffer) {
  const csvString = fileBuffer.toString('utf-8');
  
  const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  const transactions = [];

  const dateNames = ['date', 'Date', 'Transaction Date', 'Posted Date'];
  const descNames = ['description', 'Description', 'Memo', 'Transaction Description', 'Narrative'];
  const amtNames = ['amount', 'Amount', 'Debit', 'Credit'];

  for (const row of parsed.data) {
    let dateStr = null;
    let desc = null;
    let amountRaw = null;
    let type = null;

    for (const name of dateNames) {
      if (row[name]) {
        dateStr = row[name];
        break;
      }
    }

    for (const name of descNames) {
      if (row[name]) {
        desc = row[name];
        break;
      }
    }

    if (row['Credit'] && !row['Debit'] && !row['Amount'] && !row['amount']) {
        amountRaw = row['Credit'];
        type = 'credit';
    } else if (row['Debit'] && !row['Credit'] && !row['Amount'] && !row['amount']) {
        amountRaw = row['Debit'];
        type = 'debit';
    } else {
        for (const name of amtNames) {
          if (row[name]) {
            amountRaw = row[name];
            if (name.toLowerCase() === 'credit') type = 'credit';
            if (name.toLowerCase() === 'debit') type = 'debit';
            break;
          }
        }
    }

    if (!dateStr || !amountRaw || desc == null) continue;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) continue;

    const amountNum = parseFloat(amountRaw.replace(/[^0-9.-]+/g, ''));
    if (isNaN(amountNum)) continue;

    if (!type) {
        type = amountNum < 0 ? 'debit' : 'credit';
    }
    
    transactions.push({
      date,
      description: desc,
      amount: Math.abs(amountNum),
      type
    });
  }

  return transactions;
}
