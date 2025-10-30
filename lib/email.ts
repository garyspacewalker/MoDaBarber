// lib/email.ts
// Works with Resend (preferred) or SMTP (Nodemailer). Sends customer + barber in parallel.

const FROM_RESEND = 'MoDeBarber <onboarding@resend.dev>';

export type Service = { name: string; price: number; duration: number };
type Mail = { to: string | string[]; subject: string; html: string; from?: string };

// ---------- Providers ----------
async function sendWithResend(mail: Mail) {
  if (!process.env.RESEND_API_KEY) throw new Error('Resend not configured');
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const out = await resend.emails.send({
    from: mail.from || FROM_RESEND,
    to: Array.isArray(mail.to) ? mail.to : [mail.to],
    subject: mail.subject,
    html: mail.html,
  });
  if (out?.error) throw new Error(`Resend error: ${out.error.message || 'unknown'}`);
  return out;
}



// lib/email.ts
async function sendWithSMTP(mail: Mail) {
  const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!hasSMTP) throw new Error('SMTP not configured');

  const nodemailer = await import('nodemailer');
  const port = Number(process.env.SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(port) === '465',    // false for 587 (STARTTLS), true for 465 (SSL)
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    requireTLS: String(port) === '587', // nudge STARTTLS
    tls: { minVersion: 'TLSv1.2' },
  });

  return transporter.sendMail({
    from: mail.from || process.env.SMTP_FROM,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
  });
}


async function sendEmail(mail: Mail) {
  // Use SMTP only while developing
  if (process.env.FORCE_SMTP === '1') {
    return await sendWithSMTP(mail);
  }

  // Otherwise try Resend, then fall back to SMTP
  try {
    if (process.env.RESEND_API_KEY) return await sendWithResend(mail);
  } catch (e) {
    console.error('Resend failed:', e);
  }
  try {
    return await sendWithSMTP(mail);
  } catch (e) {
    console.error('SMTP failed:', e);
  }
  console.warn('No email provider configured. Skipping send.');
  return null;
}


// ---------- Templates ----------
function toCurrency(n: number) {
  return `R${Math.round(n)}`;
}

function bookingHtml(opts: {
  title: string;
  first?: string;
  last?: string;
  phone?: string;
  email?: string;
  date: string;
  time: string;
  services: Service[];
  ref: string;
}) {
  const total = opts.services.reduce((s, x) => s + (x.price || 0), 0);
  const items = opts.services
    .map(
      (s) =>
        `<tr><td>${s.name}</td><td style="text-align:right">${toCurrency(s.price)}</td></tr>`
    )
    .join('');
  const customer = [opts.first, opts.last].filter(Boolean).join(' ');

  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;">
    <h2>${opts.title}</h2>
    <p><b>When:</b> ${opts.date} @ ${opts.time}</p>
    <table style="width:100%;border-collapse:collapse;margin:10px 0 4px 0">
      ${items}
      <tr>
        <td style="border-top:1px solid #e5e7eb;padding-top:6px"><b>Total</b></td>
        <td style="text-align:right;border-top:1px solid #e5e7eb;padding-top:6px"><b>${toCurrency(
          total
        )}</b></td>
      </tr>
    </table>
    <p><b>Customer:</b> ${customer || 'N/A'} • ${opts.phone || ''} • ${opts.email || ''}</p>
    <p style="font-size:12px;color:#6b7280">Ref: ${opts.ref}</p>
  </div>`;
}

// ---------- Public API ----------
export async function sendBookingEmails(opts: {
  bookingId: string;
  customer?: { first?: string; last?: string; phone?: string; email?: string };
  date: string;
  time: string;
  services: Service[];
}) {
  const { bookingId, customer, date, time, services } = opts;

  const htmlCustomer = bookingHtml({
    title: 'Your booking is confirmed ✅',
    first: customer?.first,
    last: customer?.last,
    phone: customer?.phone,
    email: customer?.email,
    date, time, services, ref: bookingId,
  });

  const htmlBarber = bookingHtml({
    title: 'New booking',
    first: customer?.first,
    last: customer?.last,
    phone: customer?.phone,
    email: customer?.email,
    date, time, services, ref: bookingId,
  });

  const barberEmail = (process.env.BARBER_EMAIL || '').trim(); // catch stray spaces
  console.log('Email targets:', { customer: customer?.email || null, barber: barberEmail || null });

  const jobs: Promise<any>[] = [];
  if (customer?.email?.trim()) {
    jobs.push(sendEmail({
      to: customer.email.trim(),
      subject: `MoDeBarber — Booking confirmed (${date} ${time})`,
      html: htmlCustomer,
    }));
  }
  if (barberEmail) {
    jobs.push(sendEmail({
      to: barberEmail,
      subject: `New booking — ${date} ${time}`,
      html: htmlBarber,
    }));
  }

  const results = await Promise.allSettled(jobs);
  console.log('Email send results:', results);
}
