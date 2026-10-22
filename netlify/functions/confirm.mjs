// GET /api/confirm?t=<signed token>
// Step 2 of double opt-in: the person clicked the link in their email.
// Verify the signature and expiry, then add them to the right Sender groups.

import { readToken, addSubscriber, groupsForSource } from '../lib/sender.mjs';

export const config = {
  path: '/api/confirm',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};

export default async (req) => {
  const t = new URL(req.url).searchParams.get('t');
  const { data, error } = readToken(t);

  if (error === 'expired') return go('/newsletter-pending?expired=1');
  if (error) return go('/newsletter-pending?error=1');

  try {
    const groups = groupsForSource(data.s);
    if (!groups.length) throw new Error('SENDER_GROUP_IMPACT_INTEL is not set');
    await addSubscriber({ email: data.e, groups, organisationType: data.o });
    console.log(`Confirmed subscriber (${data.s}) into ${groups.join(',')}`);
  } catch (err) {
    console.error(err);
    return go('/newsletter-pending?error=1');
  }

  return go('/newsletter-confirmed');
};

const go = (path) => new Response(null, { status: 303, headers: { Location: path, 'Cache-Control': 'no-store' } });
