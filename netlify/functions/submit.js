const QUESTIONS = [
  "What situation, challenge, or change is this work responding to?",
  "Who does this matter most to?",
  "What ways of knowing tell you this situation needs attention?",
  "If this is not addressed, what is likely to continue or worsen?",
  "If this work is successful, what will be different?",
  "Which level best reflects the primary change you are contributing to?",
  "Over what timeframe would you realistically expect to see this change?",
  "What practices, actions, or responsibilities will this work involve?",
  "For each action, how much control do you have?",
  "What immediate, tangible results come from these actions?",
  "Who directly engages with or benefits from these results?",
  "What is strengthened, supported, or changed in the short term?",
  "If those changes continue, what happens next?",
  "Over time, what does this work contribute to?",
  "What conditions need to be respected or supported for this work to happen well?",
  "Who holds decision-making authority for this work?",
  "What could realistically disrupt or slow this work?",
  "How would you know meaningful change is happening?",
  "What information or knowledge do you already gather?",
  "Do you currently have the time, systems, and support to carry this work well?",
  "What would tell you this work needs to pause, adapt, or stop?"
];

const SYSTEM_PROMPT = `You are a Strategic Impact Logic Facilitator for Keystone Impact Solutions.

You are receiving pre-collected responses to a structured 21-question facilitation process. Your task is to generate the final Impact Logic output based on these responses only. Do not ask further questions. Generate the output sections only.

CORE PRINCIPLES — apply throughout:
- Multiple ways of knowing are valid: cultural knowledge, lived experience, observation, and data.
- Impact is about contribution, not sole ownership or causation.
- Clarity matters more than confidence.
- Short or incomplete answers are acceptable — assess from what is present, not what is missing.
- Mild discomfort in the output is acceptable. Protective honesty is preferred over false reassurance.

OUTPUT STRUCTURE:
Generate exactly these six sections, in this order. Use the section headers exactly as written below. Do not add additional sections or commentary outside these six.

---

## Strategic Impact Summary

Write 3–5 sentences describing the work, who it serves, the change it seeks, and your overall confidence in the logic based on the responses. Be specific. Do not use hollow framing.

---

## Theory of Change Narrative

Write a plain-English narrative connecting activities to outcomes to contribution. Use clear, accessible language. Acknowledge assumptions and shared responsibility where relevant. Do not use jargon. The narrative should read as a coherent story of how this work creates change — not a list.

---

## Impact Logic Summary

Present these five sub-sections with their labels in bold:

**Context:** What situation this work responds to, and who it matters to.

**Actions:** What the work does in practice, including the level of control held.

**Results:** Immediate, tangible outputs from those actions.

**Change Over Time:** Short, medium, and longer-term changes the work contributes to.

**Contribution:** What this work contributes to at a broader or longer-term level.

---

## Readiness Signal

State ONE signal only: GREEN, AMBER, or RED. State it clearly on its own line.

Signal logic (do not reveal this logic in the output):
- GREEN: coherent causal logic, realistic outcomes, acknowledged assumptions, plausible evidence, no major capacity contradictions.
- AMBER: mostly coherent logic with identifiable gaps — for example: vague outcomes, weak missing middle between activities and impact, unclear evidence basis, or scope broader than the logic can support.
- RED: impact logic not yet clear — for example: an activity-to-impact leap with no pathway, unclear beneficiaries, implausible causal pathway, or heavy untested assumptions.

After stating the signal, include this exact sentence:
A GREEN, AMBER, or RED signal reflects clarity about readiness — not judgement about the value of your work.

---

## Guidance

If signal is GREEN:
Title: How to use this clarity well

Focus on stewardship, not improvement. Emphasise: selectivity in what to apply for, integrity of the story across different contexts, alignment between the impact logic and the opportunities pursued, and revisiting the logic as conditions change. No urgency. No task lists.

If signal is AMBER:
Title: Recommended areas to clarify

Provide 3–4 reflective prompts focused on: outcomes versus activities, the missing middle between what you do and what you claim, evidence expectations, and scope relative to influence. Frame as questions, not instructions. No urgency.

If signal is RED:
Title: Foundations to strengthen before applying

Provide 3–5 reflective prompts focused on: what intended change actually looks like, who the beneficiaries are and how they experience the work, the plausibility of the causal pathway, the boundaries of impact claimed, and learning before seeking recognition. Protective, non-judgemental tone. No urgency.

---

## Options You May Consider Next

Begin with exactly this sentence: What you do next is a judgement call.

Then include the signal-appropriate text below, exactly as written:

If GREEN:
If you'd like to explore how to use this foundation well — whether that's a specific opportunity, a funding strategy, or something else — book a discovery call with Dr Jess: https://keystone-impact-solutions.moxieapp.com/public/discovery-call

If AMBER:
If you'd like a thinking partner to help you close these gaps strategically, book a discovery call with Dr Jess: https://keystone-impact-solutions.moxieapp.com/public/discovery-call

If RED:
If you'd like support strengthening your organisation's fundable foundations strategically so that you're ready when the right opportunity arrives, book a discovery call with Dr Jess to discuss the Strategic Funding Partnership: https://keystone-impact-solutions.moxieapp.com/public/discovery-call

For all signals, also include:
Learn more: https://keystoneimpactsolutions.au

TONE RULES:
- No urgency, no promises, no optimisation language.
- Calm, grounded, non-judgemental throughout.
- Clear and direct. Do not soften findings to the point of meaninglessness.
- Do not reveal the internal signal logic in the output.`;

export const handler = async (event) => {
  // Handle CORS and preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log('=== SUBMIT FUNCTION CALLED ===');
    console.log('ENV KEYS:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('EMAIL')));

    // Check environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY environment variable' })
      };
    }
    if (!process.env.BREVO_API_KEY) {
      console.error('Missing BREVO_API_KEY');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing BREVO_API_KEY environment variable' })
      };
    }

    console.log('Environment variables OK');
    const body = JSON.parse(event.body);
    console.log('Request body parsed, answers count:', Object.keys(body.answers || {}).length);
    const { answers, level, email, shareWithJess } = body;

    // Validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    const nonEmptyAnswers = Object.values(answers || {}).filter(a => a && a.trim().length > 0).length;
    if (nonEmptyAnswers < 15) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please answer at least 15 questions' })
      };
    }

    // Build user message for API
    const userMessage = QUESTIONS.map((q, i) => {
      const answer = i === 5 ? level : (answers[i + 1] || 'No answer provided.');
      return `Q${i + 1}: ${q}\nA: ${answer}`;
    }).join('\n\n');

    // Call Anthropic API
    const anthropicPayload = {
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    };
    console.log('Sending to Anthropic:', JSON.stringify(anthropicPayload).substring(0, 200));

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(anthropicPayload)
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      console.error('Anthropic error response:', JSON.stringify(errorData));
      throw new Error(`Anthropic API error: ${anthropicResponse.statusText} - ${JSON.stringify(errorData)}`);
    }

    const anthropicData = await anthropicResponse.json();
    const aiOutput = anthropicData.content[0].text;

    // Extract readiness signal
    const signalMatch = aiOutput.match(/## Readiness Signal\s+\n(GREEN|AMBER|RED)/);
    const signal = signalMatch ? signalMatch[1] : 'UNKNOWN';

    // Send email to user
    await sendUserEmail(email, aiOutput, signal);

    // Send notification to Jess if opted in
    if (shareWithJess) {
      await sendJessNotification(email, signal, answers, level, aiOutput);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
};

async function sendUserEmail(userEmail, aiOutput, signal) {
  const htmlContent = buildUserEmailHtml(aiOutput, signal);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: process.env.SENDER_NAME || 'Keystone Impact Solutions',
        email: process.env.SENDER_EMAIL || 'hello@keystoneimpactsolutions.au'
      },
      to: [{ email: userEmail }],
      subject: 'Your Strategic Impact Logic Output — Keystone Impact Solutions',
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    throw new Error(`Brevo API error: ${response.statusText}`);
  }
}

function buildUserEmailHtml(aiOutput, signal) {
  const signalColours = {
    GREEN: { bg: '#294B3F', text: '#D8D1CB' },
    AMBER: { bg: '#A1573A', text: '#D8D1CB' },
    RED: { bg: '#6B2737', text: '#D8D1CB' },
    UNKNOWN: { bg: '#999A96', text: '#D8D1CB' }
  };

  const colours = signalColours[signal];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', Arial, sans-serif; background: #D8D1CB; color: #333333; }
    .container { max-width: 600px; margin: 0 auto; background: #D8D1CB; }
    .header { background: #333333; padding: 40px 24px; text-align: center; }
    .header-logo { font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; color: #D8D1CB; margin-bottom: 8px; }
    .header-eyebrow { font-family: 'Quicksand', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #A1573A; }
    .content-section { background: white; border: 1px solid #294B3F; margin: 20px; padding: 32px; }
    .content-section h2 { font-family: 'Lora', Georgia, serif; font-size: 18px; font-weight: 600; color: #294B3F; margin-top: 24px; margin-bottom: 16px; }
    .content-section h2:first-child { margin-top: 0; }
    .content-section h3 { font-family: 'Lora', Georgia, serif; font-size: 15px; font-weight: 600; color: #294B3F; margin-top: 16px; margin-bottom: 12px; }
    .content-section p { font-size: 16px; line-height: 1.6; margin-bottom: 16px; color: #333333; }
    .signal-block { margin: 20px; padding: 40px 32px; text-align: center; background: ${colours.bg}; }
    .signal-eyebrow { font-family: 'Quicksand', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: ${colours.text}; margin-bottom: 16px; }
    .signal-text { font-family: 'Lora', Georgia, serif; font-size: 48px; font-weight: 600; color: ${colours.text}; margin-bottom: 20px; }
    .signal-note { font-size: 14px; line-height: 1.6; color: ${colours.text}; }
    .insight-box { background: #D4E2ED; border-left: 3px solid #294B3F; padding: 24px; margin: 20px 0; }
    .button { display: inline-block; padding: 14px 28px; background: #294B3F; color: #D8D1CB; font-family: 'Quicksand', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-radius: 2px; }
    .footer { background: #333333; color: #D8D1CB; padding: 32px 24px; text-align: center; font-size: 13px; }
    .footer a { color: #A1573A; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">KIS</div>
      <div class="header-eyebrow">STRATEGIC IMPACT LOGIC OUTPUT</div>
    </div>

    <div class="content-section">
      <h2>Your Impact Logic output</h2>
      <p>Thank you for completing this process. Below is your personalised Impact Logic Summary and Theory of Change narrative.</p>
    </div>

    ${aiOutput.split('---').map((section, idx) => {
      if (idx === 0 || !section.trim()) return '';
      const lines = section.trim().split('\n');
      const heading = lines[0].replace(/^##\s+/, '').trim();
      const content = lines.slice(1).join('\n').trim();

      if (heading.includes('Readiness Signal')) return '';

      return `
      <div class="content-section">
        <div style="font-family: 'Quicksand', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #294B3F; margin-bottom: 12px;">${heading.toUpperCase()}</div>
        <div>${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}</div>
      </div>
      `;
    }).join('')}

    <div class="signal-block">
      <div class="signal-eyebrow">YOUR READINESS SIGNAL</div>
      <div class="signal-text">${signal}</div>
      <div class="signal-note">A GREEN, AMBER, or RED signal reflects clarity about readiness — not judgement about the value of your work.</div>
    </div>

    <div class="content-section">
      <h2 style="margin-top: 0;">What comes next</h2>
      <p><strong>What you do next is a judgement call.</strong></p>
      <p><a href="https://keystone-impact-solutions.moxieapp.com/public/discovery-call" class="button">Book a discovery call →</a></p>
      <p style="margin-top: 20px;"><a href="https://keystoneimpactsolutions.au">Learn more: keystoneimpactsolutions.au</a></p>
    </div>

    <div class="footer">
      <p>Keystone Impact Solutions</p>
      <p><a href="https://keystoneimpactsolutions.au">keystoneimpactsolutions.au</a></p>
      <p style="margin-top: 16px; opacity: 0.7;"><a href="https://keystoneimpactsolutions.au/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendJessNotification(userEmail, signal, answers, level, aiOutput) {
  const plainText = `
Readiness signal: ${signal}

User email: ${userEmail}
Submitted: ${new Date().toISOString()}

--- FULL Q&A RESPONSES ---

${QUESTIONS.map((q, i) => {
  const answer = i === 5 ? level : (answers[i + 1] || 'No answer provided.');
  return `Q${i + 1}: ${q}\nA: ${answer}`;
}).join('\n\n')}

--- AI-GENERATED OUTPUT ---

${aiOutput}
  `;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'Keystone Impact Solutions',
        email: process.env.SENDER_EMAIL || 'hello@keystoneimpactsolutions.au'
      },
      to: [{ email: process.env.JESS_EMAIL }],
      subject: `[${signal}] — Impact Logic output shared: ${userEmail}`,
      textContent: plainText
    })
  });

  if (!response.ok) {
    console.warn(`Failed to send Jess notification: ${response.statusText}`);
  }
}
