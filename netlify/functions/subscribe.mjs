// POST /api/subscribe
// Step 1 of double opt-in: validate the form, then email a signed confirmation link.
// Nobody is added to Sender until they click that link (see confirm.mjs).

import { ORG_TYPES, isEmail, makeToken, sendEmail, escapeHtml } from '../lib/sender.mjs';

export const config = {
  path: '/api/subscribe',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};

const SOURCES = ['newsletter', 'grant-readiness'];

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const wantsJson = (req.headers.get('accept') || '').includes('application/json');
  const origin = new URL(req.url).origin;

  let form;
  try {
    const type = req.headers.get('content-type') || '';
    if (type.includes('application/json')) {
      form = await req.json();
    } else {
      form = Object.fromEntries(await req.formData());
    }
  } catch {
    return reply(400, 'Please check your email address and try again.');
  }

  // Honeypot: real people never see or fill this field.
  if (form.website) return reply(200, 'ok');

  const email = String(form.email || '').trim().toLowerCase();
  const organisationType = ORG_TYPES.includes(form.organisation_type) ? form.organisation_type : '';
  const source = SOURCES.includes(form.source) ? form.source : 'newsletter';

  if (!isEmail(email)) return reply(400, 'Please check your email address and try again.');

  try {
    const token = makeToken({ e: email, o: organisationType, s: source });
    const link = `${origin}/api/confirm?t=${encodeURIComponent(token)}`;
    await sendEmail({
      to: email,
      subject: 'Please confirm your Impact Intel subscription',
      html: confirmHtml(link),
      text: confirmText(link)
    });
  } catch (err) {
    console.error(err);
    return reply(502, 'Something went wrong on our side. Please try again in a few minutes.');
  }

  return reply(200, 'ok');

  function reply(status, message) {
    if (wantsJson) {
      return Response.json({ ok: status === 200, message }, { status });
    }
    // No-JavaScript fallback: send the browser to a plain page.
    const to = status === 200 ? '/newsletter-pending' : '/newsletter-pending?error=1';
    return new Response(null, { status: 303, headers: { Location: to } });
  }
};

// ── Confirmation email. Jess to review the wording before launch. ──────
function confirmText(link) {
  return [
    'Hi,',
    '',
    'Thanks for signing up to Impact Intel from Keystone Impact Solutions.',
    '',
    'Please confirm your email address so I can add you to the list:',
    link,
    '',
    'The link works for 3 days. If you did not sign up, ignore this email and nothing will happen.',
    '',
    'Jess',
    'Keystone Impact Solutions',
    'https://keystoneimpactsolutions.au'
  ].join('\n');
}

function confirmHtml(link) {
  const l = escapeHtml(link);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm your subscription</title></head>
<body style="margin:0;padding:0;background:#D8D1CB;font-family:Arial,Helvetica,sans-serif;color:#333333;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#D8D1CB;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #294B3F;">
<tr><td style="background:#333333;padding:24px 32px;font-family:Georgia,serif;font-size:22px;color:#D8D1CB;">Impact Intel</td></tr>
<tr><td style="padding:32px;font-size:16px;line-height:1.6;">
<p style="margin:0 0 16px;">Hi,</p>
<p style="margin:0 0 16px;">Thanks for signing up to Impact Intel from Keystone Impact Solutions.</p>
<p style="margin:0 0 24px;">Please confirm your email address so I can add you to the list.</p>
<p style="margin:0 0 24px;"><a href="${l}" style="display:inline-block;padding:14px 28px;background:#294B3F;color:#D8D1CB;text-decoration:none;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:13px;">Confirm my subscription</a></p>
<p style="margin:0 0 16px;font-size:14px;color:#555555;">The link works for 3 days. If you did not sign up, ignore this email and nothing will happen.</p>
<p style="margin:24px 0 0;">Jess<br>Keystone Impact Solutions</p>
</td></tr>
<tr><td style="padding:16px 32px;background:#333333;font-size:12px;color:#D8D1CB;"><a href="https://keystoneimpactsolutions.au" style="color:#D8D1CB;">keystoneimpactsolutions.au</a></td></tr>
</table></td></tr></table></body></html>`;
}
