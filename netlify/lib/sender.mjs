// Shared helpers for the Sender (sender.net) integration.
// Used by netlify/functions/subscribe.mjs and netlify/functions/confirm.mjs.
//
// Environment variables (set in Netlify > Project configuration > Environment variables):
//   SENDER_API_TOKEN            Sender API access token (Settings > API access tokens). Secret.
//   SUBSCRIBE_SECRET            Random string used to sign confirmation links. Secret.
//   SENDER_GROUP_IMPACT_INTEL   Optional. Sender group ID for Impact Intel. If unset, the group titled
//                               "Impact Intel" is found, or created on the first confirmation.
//   SENDER_GROUP_GRANT_READINESS  Sender group ID for the Grant Readiness lead magnet (optional).
//   SENDER_EMAIL / SENDER_NAME  From address and name (defaults below).

import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.sender.net/v2';

export const ORG_TYPES = [
  'Business', 'Non-profit', 'Social enterprise', 'Government', 'NRM',
  'Academic', 'Individual', 'Other', 'Unknown'
];

export const NEWSLETTER_GROUP_TITLE = 'Impact Intel';

// Which Sender groups each website form adds people to, once they confirm.
export async function groupsForSource(source) {
  const news = process.env.SENDER_GROUP_IMPACT_INTEL || (await ensureGroup(NEWSLETTER_GROUP_TITLE));
  const gra = process.env.SENDER_GROUP_GRANT_READINESS || 'e1zyLP';
  let groups = [news];
  if (source === 'grant-readiness') groups = [news, gra];
  if (source === 'impact-logic') {
    groups = [news, process.env.SENDER_GROUP_IMPACT_LOGIC || (await ensureGroup(IMPACT_LOGIC_GROUP_TITLE))];
  }
  return groups.filter(Boolean);
}

export const IMPACT_LOGIC_GROUP_TITLE = 'LM | Impact Logic';

// Step 1 of double opt-in, shared by subscribe.mjs and submit.js (Impact Logic).
// Emails a signed confirmation link. Nobody is added to Sender until they click it.
export async function sendConfirmation({ email, origin, source, organisationType = '', firstname = '', lastname = '' }) {
  const token = makeToken({ e: email, o: organisationType, s: source, f: firstname, l: lastname });
  const link = `${origin}/api/confirm?t=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'Confirm your Impact Intel subscription',
    html: confirmHtml(link, firstname),
    text: confirmText(link, firstname)
  });
}

// ── Confirmation email. Copy drafted 23 October 2026, awaiting Jess's approval. ──
// Greeting: "Hey <first name>," when given, "Hey there," when not.
const greeting = (firstname) => `Hey ${firstname || 'there'},`;

function confirmText(link, firstname) {
  return [
    greeting(firstname),
    '',
    "Thanks for signing up to Impact Intel. One click and you’re on the list:",
    '',
    link,
    '',
    "That link stays live for three days. If you didn’t sign up, ignore this email and nothing happens (no list, no follow-ups).",
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

// Find a group by exact title, or create it. Cached per function instance.
const groupCache = new Map();
export async function ensureGroup(title) {
  if (groupCache.has(title)) return groupCache.get(title);
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${API}/groups?page=${page}`, { headers: headers() });
    if (!res.ok) throw new Error(`Sender list groups failed: ${res.status}`);
    const body = await res.json();
    const found = (body.data || []).find((g) => (g.title || '').trim().toLowerCase() === title.toLowerCase());
    if (found) { groupCache.set(title, found.id); return found.id; }
    const last = body.meta?.last_page ?? body.last_page ?? 1;
    if (page >= last || !(body.data || []).length) break;
  }
  const create = await fetch(`${API}/groups`, { method: 'POST', headers: headers(), body: JSON.stringify({ title }) });
  if (!create.ok) throw new Error(`Sender create group failed: ${create.status} ${(await create.text().catch(() => '')).slice(0, 200)}`);
  const id = (await create.json()).data?.id;
  if (!id) throw new Error('Sender create group returned no id');
  console.log(`Created Sender group "${title}" (${id})`);
  groupCache.set(title, id);
  return id;
}

export function fromAddress() {
  return {
    email: process.env.SENDER_EMAIL || 'hello@keystoneimpactsolutions.au',
    name: process.env.SENDER_NAME || 'Keystone Impact Solutions'
  };
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}

// Transactional email. Body fields per https://api.sender.net/transactional-campaigns/send-transactional/
export async function sendEmail({ to, subject, html, text }) {
  const res = await fetch(`${API}/message/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ from: fromAddress(), to: { email: to }, subject, html, text })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Sender send failed: ${res.status} ${detail.slice(0, 300)}`);
  }
  return res.json().catch(() => ({}));
}

// Create the subscriber in the given groups. If they already exist,
// add them to each group instead (Sender refuses a duplicate create).
export async function addSubscriber({ email, groups, organisationType, firstname, lastname }) {
  const fields = {};
  if (organisationType) fields['{$organisation_type}'] = organisationType;

  const create = await fetch(`${API}/subscribers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, groups, fields, trigger_automation: true, ...(firstname ? { firstname } : {}), ...(lastname ? { lastname } : {}) })
  });
  if (create.ok) return { created: true };

  const createDetail = await create.text().catch(() => '');
  for (const g of groups) {
    const res = await fetch(`${API}/subscribers/groups/${encodeURIComponent(g)}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ subscribers: [email], trigger_automation: true })
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Sender subscribe failed: create ${create.status} ${createDetail.slice(0, 200)} | group ${g} ${res.status} ${detail.slice(0, 200)}`);
    }
  }
  return { created: false };
}

// ── Signed confirmation tokens (stateless double opt-in) ──────────────
const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(data) {
  const secret = process.env.SUBSCRIBE_SECRET;
  if (!secret) throw new Error('SUBSCRIBE_SECRET is not set');
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function makeToken(payload, ttlHours = 72) {
  const body = b64url(JSON.stringify({ ...payload, x: Date.now() + ttlHours * 3600 * 1000 }));
  return `${body}.${sign(body)}`;
}

export function readToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return { error: 'invalid' };
  const [body, sig] = token.split('.');
  const expected = sign(body);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { error: 'invalid' };
  let data;
  try { data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return { error: 'invalid' }; }
  if (!data.x || Date.now() > data.x) return { error: 'expired' };
  return { data };
}

export const isEmail = (s) =>
  typeof s === 'string' && s.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(s);

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
