// POST /api/subscribe
// Step 1 of double opt-in: validate the form, then email a signed confirmation link.
// Nobody is added to Sender until they click that link (see confirm.mjs).

import { ORG_TYPES, isEmail, sendConfirmation } from '../lib/sender.mjs';

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
    await sendConfirmation({ email, origin, source, organisationType, firstname, lastname });
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
