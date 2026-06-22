export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { answers, level, email, shareWithJess } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const nonEmpty = Object.values(answers || {}).filter(a => a && a.trim().length > 0).length;
    if (nonEmpty < 15) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Need 15+ answers' }) };
    }

    console.log('Triggering Lambda for:', email);
    fetch('https://gslqfjdu4a.execute-api.us-east-2.amazonaws.com/default/impact-logic-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, level, email, shareWithJess })
    }).catch(err => console.error('Lambda trigger error:', err.message));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error:', error.message);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
  }
};
