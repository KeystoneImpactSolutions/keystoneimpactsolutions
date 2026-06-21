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
  console.log('=== BACKGROUND PROCESSING STARTED ===');
  const startTime = Date.now();

  try {
    console.log('Event received. Event body type:', typeof event.body);
    console.log('Event body preview:', event.body ? event.body.substring(0, 100) : 'empty');

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (e) {
      console.error('✗ Failed to parse event body:', e.message);
      throw new Error(`Invalid JSON body: ${e.message}`);
    }

    const { answers, level, email, shareWithJess } = parsedBody;
    console.log('✓ Parsed request. Email:', email, 'Level:', level, 'Share:', shareWithJess);

    // Check environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Missing BREVO_API_KEY');
    }
    console.log('✓ API keys present');

    // Build user message
    const userMessage = QUESTIONS.map((q, i) => {
      const answer = i === 5 ? level : (answers[i + 1] || 'No answer provided.');
      return `Q${i + 1}: ${q}\nA: ${answer}`;
    }).join('\n\n');
    console.log('✓ Built user message:', userMessage.length, 'chars');

    console.log('→ Calling Anthropic API...');
    const anthropicPayload = {
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    };
    const anthropicPayloadSize = JSON.stringify(anthropicPayload).length;
    console.log('  Payload size:', anthropicPayloadSize, 'bytes');
    console.log('  System prompt size:', SYSTEM_PROMPT.length, 'bytes');
    console.log('  User message size:', userMessage.length, 'bytes');

    const anthropicStart = Date.now();
    let anthropicResponse;

    try {
      anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(anthropicPayload)
      });
    } catch (e) {
      console.error('  ✗ Fetch to Anthropic failed:', e.message, e.stack);
      throw new Error(`Anthropic fetch failed: ${e.message}`);
    }

    const anthropicDuration = Date.now() - anthropicStart;
    console.log('✓ Anthropic responded. Status:', anthropicResponse.status, anthropicResponse.statusText);
    console.log('  Duration:', anthropicDuration + 'ms');
    console.log('  Response headers:', JSON.stringify(Object.fromEntries(anthropicResponse.headers)));

    if (!anthropicResponse.ok) {
      let errorData;
      try {
        errorData = await anthropicResponse.json();
      } catch (e) {
        console.error('  ✗ Could not parse Anthropic error JSON:', e.message);
        errorData = { error: 'Could not parse error response' };
      }
      console.error('✗ Anthropic HTTP error:', anthropicResponse.status);
      console.error('  Error response:', JSON.stringify(errorData, null, 2));
      throw new Error(`Anthropic HTTP ${anthropicResponse.status}: ${JSON.stringify(errorData)}`);
    }

    let anthropicData;
    try {
      anthropicData = await anthropicResponse.json();
    } catch (e) {
      console.error('✗ Failed to parse Anthropic response JSON:', e.message, e.stack);
      throw new Error(`Invalid Anthropic response: ${e.message}`);
    }

    console.log('  Response structure:', Object.keys(anthropicData));
    if (anthropicData.content) {
      console.log('  Content items:', anthropicData.content.length);
      console.log('  First content type:', anthropicData.content[0]?.type);
    }

    const aiOutput = anthropicData.content[0].text;
    console.log('✓ AI output received:', aiOutput.length, 'chars');
    console.log('  First 300 chars:', aiOutput.substring(0, 300));

    // Extract signal
    const signalMatch = aiOutput.match(/## Readiness Signal\s+\n(GREEN|AMBER|RED)/);
    const signal = signalMatch ? signalMatch[1] : 'UNKNOWN';
    console.log('✓ Signal extracted:', signal);

    // Build email
    const htmlContent = buildUserEmailHtml(aiOutput, signal);
    console.log('✓ HTML email built:', htmlContent.length, 'chars');

    console.log('→ Sending email to user:', email);
    const emailStart = Date.now();

    // Send email to user
    await sendEmail(email, htmlContent, 'Your Strategic Impact Logic Output — Keystone Impact Solutions');
    const emailDuration = Date.now() - emailStart;
    console.log('✓ User email sent. Duration:', emailDuration + 'ms');

    // Send notification to Jess
    if (shareWithJess && process.env.JESS_EMAIL) {
      console.log('→ Sending notification to Jess:', process.env.JESS_EMAIL);
      const plainText = `Readiness signal: ${signal}\n\nUser email: ${email}\nSubmitted: ${new Date().toISOString()}\n\n--- FULL Q&A ---\n\n${QUESTIONS.map((q, i) => {
        const answer = i === 5 ? level : (answers[i + 1] || 'No answer provided.');
        return `Q${i + 1}: ${q}\nA: ${answer}`;
      }).join('\n\n')}\n\n--- AI OUTPUT ---\n\n${aiOutput}`;

      const jessStart = Date.now();
      await sendEmail(process.env.JESS_EMAIL, plainText, `[${signal}] — Impact Logic output shared: ${email}`, true);
      const jessDuration = Date.now() - jessStart;
      console.log('✓ Jess notification sent. Duration:', jessDuration + 'ms');
    }

    const totalDuration = Date.now() - startTime;
    console.log('=== BACKGROUND PROCESSING COMPLETE ===');
    console.log('Total duration:', totalDuration + 'ms');
    return { statusCode: 200 };
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('=== BACKGROUND PROCESSING ERROR ===');
    console.error('Duration before error:', totalDuration + 'ms');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    return { statusCode: 500 };
  }
};

async function sendEmail(toEmail, content, subject, isPlainText = false) {
  console.log('  → Sending', isPlainText ? 'plaintext' : 'HTML', 'email to:', toEmail);
  console.log('    Subject:', subject);
  console.log('    Content type:', isPlainText ? 'text/plain' : 'text/html');
  console.log('    Content size:', content.length, 'bytes');

  const emailPayload = {
    sender: {
      name: process.env.SENDER_NAME || 'Keystone Impact Solutions',
      email: process.env.SENDER_EMAIL || 'hello@keystoneimpactsolutions.au'
    },
    to: [{ email: toEmail }],
    subject: subject,
    ...(isPlainText ? { textContent: content } : { htmlContent: content })
  };

  console.log('    Payload size:', JSON.stringify(emailPayload).length, 'bytes');

  const fetchStart = Date.now();
  let response;

  try {
    response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
  } catch (e) {
    console.error('  ✗ Fetch to Brevo failed:', e.message);
    throw new Error(`Brevo fetch failed: ${e.message}`);
  }

  const duration = Date.now() - fetchStart;
  console.log('  ✓ Brevo responded. Status:', response.status, response.statusText, `(${duration}ms)`);
  console.log('    Response headers:', JSON.stringify(Object.fromEntries(response.headers)));

  if (!response.ok) {
    let errorBody = 'No response body';
    try {
      errorBody = await response.text();
    } catch (e) {
      console.error('    Failed to read error body:', e.message);
    }
    console.error('  ✗ Brevo error response:', errorBody);
    throw new Error(`Brevo HTTP ${response.status}: ${errorBody}`);
  }

  let responseBody = '';
  try {
    responseBody = await response.text();
  } catch (e) {
    console.error('  ✗ Failed to read Brevo response body:', e.message);
  }
  console.log('  ✓ Email sent successfully');
  console.log('    Response:', responseBody.substring(0, 100));
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
    </div>
  </div>
</body>
</html>
  `;
}
