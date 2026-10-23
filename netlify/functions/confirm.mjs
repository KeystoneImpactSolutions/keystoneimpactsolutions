// GET /api/confirm?t=<signed token>
// Step 2 of double opt-in: the person clicked the link in their email.
// Verify the signature and expiry, then add them to the right Sender groups.

import { readToken, addSubscriber, groupsForSource } from '../lib/sender.mjs';

export const config = {
  path: '/api/confirm',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};

export default async (req) => {
  const url = new URL(req.url);
  const t = url.searchParams.get('t');
  // Absolute Location with an explicit empty query so the token is not carried into the address bar.
  const go = (path) => new Response(null, { status: 303, headers: { Location: new URL(path.includes('?') ? path : path + '?', url.origin).href.replace(/\?$/, ''), 'Cache-Control': 'no-store' } });
  const { data, error } = readToken(t);

  if (error === 'expired') return go('/newsletter-pending?expired=1');
  if (error) return go('/newsletter-pending?error=1');

  try {
    const groups = await groupsForSource(data.s);
    if (!groups.length) throw new Error('No Sender groups resolved');
    await addSubscriber({ email: data.e, groups, organisationType: data.o, firstname: data.f, lastname: data.l });
    console.log(`Confirmed subscriber (${data.s}) into ${groups.join(',')}`);
  } catch (err) {
    console.error(err);
    return go('/newsletter-pending?error=1');
  }

  return go('/newsletter-confirmed');
};

