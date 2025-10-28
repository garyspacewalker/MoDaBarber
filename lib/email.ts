// Provider-agnostic email helper: prefers Resend, falls back to SMTP (Nodemailer).
// Safe: won't crash if no provider is configured.

const FROM_RESEND = 'MoDeBarber <onboarding@resend.dev>';

type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

async function sendWithResend(mail: Mail) {
  if (!process.env.RESEND_API_KEY) throw new Error('Resend not configured');
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: mail.from || FROM_RESEND,
    to: Array.isArray(mail.to) ? mail.to : [mail.to],
    subject: mail.subject,
    html: mail.html,
  });
}

async function sendWithSMTP(mail: Mail) {
  const hasSMTP =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!hasSMTP) throw new Error('SMTP not configured');
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_PORT || '') === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter.sendMail({
    from: mail.from || process.env.SMTP_FROM,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
  });
}

async function sendEmail(mail: Mail) {
  try {
    if (process.env.RESEND_API_KEY) return await sendWithResend(mail);
  } catch {}
  try {
    return await sendWithSMTP(mail);
  } catch {}
  // No email provider configured — don't crash the app.
  console.warn('No email provider configured (RESEND_API_KEY or SMTP_*). Skipping send.');
  return null;
}

export async function sendBookingEmails(opts: {
  bookingId: string;
  customer?: { email?: string; first?: string; last?: string; phone?: string };
  date: string;
  time: string;
  services: Array<{ name: string; price: number; duration: number }>;
}) {
  const { customer, date, time, services, bookingId } = opts;
  const servicesHtml = services.map(s => `<li>${s.name} — R${s.price} • ${s.duration} min</li>`).join('');

  if (customer?.email) {
    await sendEmail({
      to: customer.email,
      subject: `Your MoDeBarber booking — ${date} ${time}`,
      html: `
        <h2>Booking confirmed</h2>
        <p>Hi ${customer.first ?? ''}, your appointment is booked for <b>${date}</b> at <b>${time}</b>.</p>
        <ul>${servicesHtml}</ul>
        <p>Ref: <b>${bookingId}</b></p>
      `,
    });
  }

  if (process.env.BARBER_EMAIL) {
    await sendEmail({
      to: process.env.BARBER_EMAIL,
      subject: `New booking — ${date} ${time}`,
      html: `
        <h3>New Booking</h3>
        <p><b>When:</b> ${date} ${time}</p>
        <p><b>Customer:</b> ${customer?.first ?? ''} ${customer?.last ?? ''} • ${customer?.phone ?? ''} • ${customer?.email ?? ''}</p>
        <ul>${servicesHtml}</ul>
        <p>Ref: <b>${bookingId}</b></p>
      `,
    });
  }
}

export async function sendOrderPaidEmail(opts: { orderId: string; email: string; amount: number }) {
  if (!opts.email) return;
  await sendEmail({
    to: [opts.email, process.env.BARBER_EMAIL || ''].filter(Boolean) as string[],
    subject: `Order paid — ${opts.orderId}`,
    html: `
      <h3>Order confirmed</h3>
      <p>Order: <b>${opts.orderId}</b></p>
      <p>Total: R${(opts.amount / 100).toFixed(2)}</p>
      <p>You'll receive shipping updates soon.</p>
    `,
  });
}
