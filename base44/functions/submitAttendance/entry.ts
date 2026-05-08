import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SPREADSHEET_ID = '171KjTvffFn6GQ1ceIYX9Ue0HzcPusQoB515xA7xHWP4';
const SHEET_NAME = 'Sheet1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    const body = await req.json();
    const { nama, instansi, tandaTangan, fotoUrl, action } = body;

    const sheetsBase = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // CHECK DUPLICATE
    if (action === 'checkDuplicate') {
      const res = await fetch(`${sheetsBase}/values/${SHEET_NAME}!B:B`, { headers });
      const data = await res.json();
      const values = data.values || [];
      const names = values.flat().map(n => n.toLowerCase().trim());
      const exists = names.includes(nama.toLowerCase().trim());
      return Response.json({ exists });
    }

    // APPEND DATA
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const values = [[timestamp, nama, instansi, fotoUrl || '', tandaTangan || '']];

    // Ensure header row exists
    const headerRes = await fetch(`${sheetsBase}/values/${SHEET_NAME}!A1:E1`, { headers });
    const headerData = await headerRes.json();
    if (!headerData.values || headerData.values.length === 0) {
      await fetch(`${sheetsBase}/values/${SHEET_NAME}!A1:E1?valueInputOption=RAW`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ values: [['Timestamp', 'Nama', 'Instansi', 'Foto URL', 'Tanda Tangan']] })
      });
    }

    const appendRes = await fetch(`${sheetsBase}/values/${SHEET_NAME}!A:E:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ values })
    });

    const appendData = await appendRes.json();
    if (appendData.error) {
      return Response.json({ error: appendData.error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});