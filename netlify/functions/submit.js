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
    const body = JSON.parse(event.body);
    const { answers, level, email, shareWithJess } = body;

    console.log('=== SUBMIT FUNCTION TRIGGERED ===');
    console.log('Email:', email);
    console.log('Level:', level);
    console.log('Share with Jess:', shareWithJess);

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    const nonEmptyAnswers = Object.values(answers || {}).filter(a => a && a.trim().length > 0).length;
    if (nonEmptyAnswers < 15) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Please answer at least 15 questions' })
      };
    }

    // Trigger background function (fire-and-forget)
    console.log('Triggering background function...');
    const netlifyHost = event.headers.host;
    const bgUrl = `https://${netlifyHost}/.netlify/functions/process-output`;
    console.log('Background URL:', bgUrl);

    fetch(bgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, level, email, shareWithJess })
    })
      .then(res => {
        console.log('Background function response status:', res.status);
        return res.text();
      })
      .then(text => console.log('Background response:', text))
      .catch(err => console.error('Background function error:', err.message));

    console.log('Background function triggered, returning success to client');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Submit function error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
};
