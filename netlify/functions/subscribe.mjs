// POST /api/subscribe
// Step 1 of double opt-in: validate the form, then email a signed confirmation link.
// Nobody is added to Sender until they click that link (see confirm.mjs).

import { ORG_TYPES, isEmail, makeToken, sendEmail, escapeHtml } from '../lib/sender.mjs';

export const config = {
  path: '/api/subscribe',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};

const SOURCES = ['newsletter', 'grant-readiness'];

// Optional name fields: trim, cap the length, drop anything that is not part of a name.
function cleanName(v) {
  return String(v || '').replace(/[<>"{}\[\]\\/@:;]/g, '').replace(/\s+/g, ' ').trim().slice(0, 50);
}

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
  const firstname = cleanName(form.firstname);
  const lastname = cleanName(form.lastname);

  if (!isEmail(email)) return reply(400, 'Please check your email address and try again.');

  try {
    const token = makeToken({ e: email, o: organisationType, s: source, f: firstname, l: lastname });
    const link = `${origin}/api/confirm?t=${encodeURIComponent(token)}`;
    await sendEmail({
      to: email,
      subject: 'Confirm your Impact Intel subscription',
      html: confirmHtml(link, firstname),
      text: confirmText(link, firstname)
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

// ── Confirmation email. Copy drafted 23 October 2026, awaiting Jess's approval. ──
// Greeting: "Hey <first name>," when given, "Hey there," when not.
const greeting = (firstname) => `Hey ${firstname || 'there'},`;

function confirmText(link, firstname) {
  return [
    greeting(firstname),
    '',
    "Thanks for signing up to Impact Intel. One click and you're on the list:",
    '',
    link,
    '',
    "That link stays live for three days. If you didn't sign up, ignore this email and nothing happens (no list, no follow-ups).",
    '',
    'Cheers,',
    'Jess',
    '',
    'Dr Jess Hodgson',
    'Keystone Impact Solutions',
    'keystoneimpactsolutions.au'
  ].join('\n');
}

function confirmHtml(link, firstname) {
  const l = escapeHtml(link);
  const p = 'margin:0 0 16px;';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm your Impact Intel subscription</title></head>
<body style="margin:0;padding:0;background:#f6f6f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;"><tr><td style="padding:32px 40px;font-family:'Open Sans',Tahoma,Verdana,sans-serif;font-size:16px;line-height:1.5;color:#333333;">
<p style="${p}">${escapeHtml(greeting(firstname))}</p>
<p style="${p}">Thanks for signing up to Impact Intel. One click and you're on the list:</p>
<p style="margin:0 0 24px;"><a href="${l}" style="display:inline-block;padding:12px 24px;background:#294B3F;color:#ffffff;text-decoration:none;font-weight:bold;">Yes, add me to the list</a></p>
<p style="${p}">That link stays live for three days. If you didn't sign up, ignore this email and nothing happens (no list, no follow-ups).</p>
<p style="margin:0;">Cheers,<br>Jess</p>
<p style="margin:16px 0 0;">Dr Jess Hodgson<br>Keystone Impact Solutions<br><a href="https://keystoneimpactsolutions.au" style="color:#6B2737;">keystoneimpactsolutions.au</a></p>
</td></tr></table></td></tr></table></body></html>`;
}
