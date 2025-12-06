type Invoice = {
  reference: string;
  issuedAt: string;
  currency: 'ZAR';
  vatPercent: number;
  note: string;
  customer: { email: string; name?: string; phone?: string; address?: string };
  lines: { id: string; name: string; unit: number; qty: number; lineTotal: number }[];
  subTotal: number;
  vat: number;
  total: number;
  status: 'Pending Payment' | 'Paid';
  bank: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
    swiftBic?: string;
    paymentRef: string;
  };
  business: { name: string; phone?: string; email?: string; address?: string };
};

export function renderInvoiceHTML(inv: Invoice) {
  const money = (n: number) => `R${n.toFixed(2)}`;
  const date = new Date(inv.issuedAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; color:#111;">
    <div style="max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="padding:20px 24px;background:#111;color:#fff;display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:600;font-size:18px">${escapeHtml(inv.business.name)}</div>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace">Invoice ${escapeHtml(inv.reference)}</div>
      </div>

      <div style="padding:20px 24px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <div style="flex:1;min-width:260px">
            <div style="font-weight:600;margin-bottom:6px">Billed To</div>
            <div>${escapeHtml(inv.customer.name || inv.customer.email)}</div>
            <div style="color:#444">${escapeHtml(inv.customer.email)}</div>
            ${inv.customer.phone ? `<div style="color:#444">${escapeHtml(inv.customer.phone)}</div>` : ''}
            ${inv.customer.address ? `<div style="color:#444;white-space:pre-wrap">${escapeHtml(inv.customer.address)}</div>` : ''}
          </div>
          <div style="flex:1;min-width:260px">
            <div style="font-weight:600;margin-bottom:6px">Details</div>
            <div>Status: <span style="font-weight:600">${inv.status}</span></div>
            <div>Issued: ${date}</div>
            ${inv.vatPercent > 0 ? `<div>VAT: ${inv.vatPercent}%</div>` : ''}
            <div>Currency: ${inv.currency}</div>
          </div>
        </div>

        <table style="width:100%;margin-top:16px;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;border-bottom:1px solid #e5e5e5;padding:8px">Item</th>
              <th style="text-align:right;border-bottom:1px solid #e5e5e5;padding:8px">Unit</th>
              <th style="text-align:right;border-bottom:1px solid #e5e5e5;padding:8px">Qty</th>
              <th style="text-align:right;border-bottom:1px solid #e5e5e5;padding:8px">Total</th>
            </tr>
          </thead>
          <tbody>
            ${inv.lines.map(l => `
              <tr>
                <td style="padding:8px;border-bottom:1px solid #f2f2f2">${escapeHtml(l.name)}</td>
                <td style="padding:8px;text-align:right;border-bottom:1px solid #f2f2f2">${money(l.unit)}</td>
                <td style="padding:8px;text-align:right;border-bottom:1px solid #f2f2f2">${l.qty}</td>
                <td style="padding:8px;text-align:right;border-bottom:1px solid #f2f2f2">${money(l.lineTotal)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:8px;text-align:right;color:#444">Subtotal</td>
              <td style="padding:8px;text-align:right">${money(inv.subTotal)}</td>
            </tr>
            ${inv.vatPercent > 0 ? `
            <tr>
              <td colspan="3" style="padding:8px;text-align:right;color:#444">VAT (${inv.vatPercent}%)</td>
              <td style="padding:8px;text-align:right">${money(inv.vat)}</td>
            </tr>` : ''}
            <tr>
              <td colspan="3" style="padding:8px;text-align:right;font-weight:700">Total</td>
              <td style="padding:8px;text-align:right;font-weight:700">${money(inv.total)}</td>
            </tr>
          </tfoot>
        </table>

        ${inv.note ? `<div style="margin-top:12px;color:#444"><strong>Note:</strong> ${escapeHtml(inv.note)}</div>` : ''}

        <div style="margin-top:16px;padding:12px;border:1px dashed #ddd;border-radius:10px;background:#fafafa">
          <div style="font-weight:600;margin-bottom:6px">EFT Payment Details</div>
          <div>Account Name: ${escapeHtml(inv.bank.accountName)}</div>
          <div>Bank: ${escapeHtml(inv.bank.bankName)}</div>
          <div>Account No: ${escapeHtml(inv.bank.accountNumber)}</div>
          <div>Branch Code: ${escapeHtml(inv.bank.branchCode)}</div>
          ${inv.bank.swiftBic ? `<div>SWIFT/BIC: ${escapeHtml(inv.bank.swiftBic)}</div>` : ''}
          <div style="margin-top:8px">Payment Reference: <span style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight:700">${escapeHtml(inv.bank.paymentRef)}</span></div>
          <div style="color:#444;margin-top:8px">Please pay within 48 hours and use the reference exactly so we can match your payment.</div>
        </div>

        <div style="margin-top:18px;color:#666;font-size:12px">
          ${escapeHtml(inv.business.name)} ${inv.business.phone ? '• '+escapeHtml(inv.business.phone) : ''} ${inv.business.email ? '• '+escapeHtml(inv.business.email) : ''}<br/>
          ${inv.business.address ? escapeHtml(inv.business.address) : ''}
        </div>
      </div>
    </div>
  </div>
  `;
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
