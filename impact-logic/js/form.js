/* ============================================================
   IMPACT LOGIC TOOL — Form Logic
   ============================================================ */

const QUESTIONS = [
  { phase: 'CONTEXT AND CHANGE', text: 'What situation, challenge, or change is this work responding to?', helper: '' },
  { phase: 'CONTEXT AND CHANGE', text: 'Who does this matter most to?', helper: '' },
  { phase: 'CONTEXT AND CHANGE', text: 'What ways of knowing tell you this situation needs attention?', helper: '' },
  { phase: 'CONTEXT AND CHANGE', text: 'If this is not addressed, what is likely to continue or worsen?', helper: '' },
  { phase: 'INTENT AND SCOPE', text: 'If this work is successful, what will be different?', helper: '' },
  { phase: 'INTENT AND SCOPE', text: 'Which level best reflects the primary change you are contributing to?', helper: '', type: 'radio', options: ['Individual', 'Community', 'Cultural', 'Environmental', 'Organisational', 'System'] },
  { phase: 'INTENT AND SCOPE', text: 'Over what timeframe would you realistically expect to see this change?', helper: '' },
  { phase: 'PRACTICES AND ACTIONS', text: 'What practices, actions, or responsibilities will this work involve?', helper: '' },
  { phase: 'PRACTICES AND ACTIONS', text: 'For each action you described, how much control do you have over it?', helper: 'Note which actions you have full control over, which are shared with others, and which you can only influence.' },
  { phase: 'DIRECT RESULTS', text: 'What immediate, tangible results come from these actions?', helper: 'Immediate results are the countable things that happen directly from your actions — documents produced, people trained, events held. Changes in people\'s behaviour or wellbeing come later.' },
  { phase: 'DIRECT RESULTS', text: 'Who directly engages with or benefits from these results?', helper: '' },
  { phase: 'CHANGE OVER TIME', text: 'What is strengthened, supported, or changed in the short term?', helper: 'Longer-term change is often the hardest part to articulate. Answer with what feels true, even if it is still forming.' },
  { phase: 'CHANGE OVER TIME', text: 'If those changes continue, what happens next?', helper: '' },
  { phase: 'CHANGE OVER TIME', text: 'Over time, what does this work contribute to?', helper: '' },
  { phase: 'CONDITIONS AND RISKS', text: 'What conditions need to be respected or supported for this work to happen well?', helper: '' },
  { phase: 'CONDITIONS AND RISKS', text: 'Who holds decision-making authority for this work?', helper: '' },
  { phase: 'CONDITIONS AND RISKS', text: 'What could realistically disrupt or slow this work?', helper: '' },
  { phase: 'EVIDENCE AND LEARNING', text: 'How would you know meaningful change is happening?', helper: '' },
  { phase: 'EVIDENCE AND LEARNING', text: 'What information or knowledge do you already gather?', helper: '' },
  { phase: 'CAPACITY', text: 'Do you currently have the time, systems, and support to carry this work well? Answer based on current reality.', helper: '' },
  { phase: 'ADAPTATION', text: 'What would tell you this work needs to pause, adapt, or stop?', helper: '' }
];

class ImpactLogicForm {
  constructor() {
    this.currentStep = 0;
    this.answers = {};
    this.level = null;
    this.devMode = new URLSearchParams(window.location.search).get('dev') === 'true';
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
  }

  cacheElements() {
    this.screens = {
      welcome: document.getElementById('screen-welcome'),
      questions: document.getElementById('screen-questions'),
      submission: document.getElementById('screen-submission'),
      thankYou: document.getElementById('screen-thank-you')
    };

    this.btnStart = document.querySelector('[data-action="start"]');
    this.btnBack = document.getElementById('btn-back');
    this.btnNext = document.getElementById('btn-next');
    this.btnSubmit = document.getElementById('btn-submit');

    this.questionInput = document.getElementById('question-input');
    this.questionText = document.getElementById('question-text');
    this.phaseLabel = document.getElementById('phase-label');
    this.helperText = document.getElementById('helper-text');
    this.currentStepDisplay = document.getElementById('current-step');

    this.emailInput = document.getElementById('email-input');
    this.shareCheckbox = document.getElementById('share-checkbox');
    this.submissionForm = document.getElementById('submission-form');
    this.submissionLoading = document.getElementById('submission-loading');
    this.submissionError = document.getElementById('submission-error');
  }

  attachEventListeners() {
    this.btnStart.addEventListener('click', () => this.goToQuestions());
    this.btnBack.addEventListener('click', () => this.previousQuestion());
    this.btnNext.addEventListener('click', () => this.nextQuestion());
    this.submissionForm.addEventListener('submit', (e) => this.submitForm(e));
    this.questionInput.addEventListener('input', () => this.updateButtonState());
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }

  goToQuestions() {
    this.currentStep = 0;
    if (this.devMode) {
      this.fillTestData();
    }
    this.renderQuestion();
    this.showScreen('questions');
  }

  fillTestData() {
    const testAnswers = {
      1: 'Climate change is increasing drought and reducing biodiversity in our region.',
      2: 'Indigenous communities and native wildlife species are most affected.',
      3: 'Local ecological knowledge, scientific data on species decline, and community reports of environmental change.',
      4: 'Habitat loss will accelerate, species extinction will increase, and community livelihoods will be threatened.',
      5: 'Restored ecosystems will support both wildlife and community wellbeing, with sustainable land management practices in place.',
      6: 'Community', // This is the radio selection (Q6)
      7: '3-5 years for initial restoration, with long-term benefits over 10+ years.',
      8: 'Community training in sustainable agriculture, native tree planting, water management, and collaborative land stewardship.',
      9: 'We have full control over training design and community engagement. Planting success depends on weather and landholder cooperation.',
      10: 'Trained community members, trees planted, water systems installed, and knowledge resources distributed.',
      11: 'Local farmers, Indigenous land managers, and conservation organisations participate directly.',
      12: 'Community capacity increases, local ecosystems recover, and sustainable practices become embedded.',
      13: 'Restored ecosystems attract wildlife, carbon sequestration increases, and community income diversifies.',
      14: 'This work contributes to regional climate resilience and demonstrates replicable models for other areas.',
      15: 'Strong community relationships, secure land access, and adequate funding for implementation.',
      16: 'Local Indigenous leaders and community councils hold authority, with external partners in advisory roles.',
      17: 'Drought, funding cuts, political changes affecting land policy, or community leadership changes could slow progress.',
      18: 'We will track biodiversity indicators, community participation rates, and ecosystem health through annual monitoring.',
      19: 'We collect species surveys, community feedback through meetings, and soil health data from partner farms.',
      20: 'We have dedicated staff and strong community commitment. We need additional funding for scaling.'
    };

    this.answers = testAnswers;
    this.level = 'Community';
  }

  renderQuestion() {
    const question = QUESTIONS[this.currentStep];
    this.phaseLabel.textContent = question.phase;
    this.questionText.textContent = question.text;
    this.currentStepDisplay.textContent = this.currentStep + 1;

    if (question.helper) {
      this.helperText.textContent = question.helper;
      this.helperText.style.display = 'block';
    } else {
      this.helperText.style.display = 'none';
    }

    // Show/hide back button
    this.btnBack.style.display = this.currentStep > 0 ? 'block' : 'none';

    // Always remove radio container first
    const existing = document.getElementById('radio-options');
    if (existing) existing.remove();

    // Clear input or populate if already answered
    if (question.type === 'radio') {
      this.renderRadioOptions(question);
    } else {
      this.questionInput.style.display = 'block';
      this.questionInput.value = this.answers[this.currentStep + 1] || '';
      this.questionInput.focus();
    }

    this.updateButtonState();
  }

  renderRadioOptions(question) {
    this.questionInput.style.display = 'none';

    // Remove existing radio container if it exists
    const existing = document.getElementById('radio-options');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'radio-options';
    container.style.marginBottom = '40px';

    question.options.forEach(option => {
      const label = document.createElement('label');
      label.style.cssText = 'display: flex; gap: 12px; margin-bottom: 12px; cursor: pointer; align-items: center;';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'level';
      input.value = option;
      input.checked = this.level === option;
      input.addEventListener('change', () => {
        this.level = option;
        this.updateButtonState();
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      container.appendChild(label);
    });

    this.questionInput.parentElement.appendChild(container);
    this.updateButtonState();
  }

  updateButtonState() {
    const question = QUESTIONS[this.currentStep];
    let isValid = false;

    if (question.type === 'radio') {
      isValid = this.level !== null;
    } else {
      isValid = this.questionInput.value.trim().length > 0;
    }

    this.btnNext.disabled = !isValid;
  }

  previousQuestion() {
    if (this.currentStep > 0) {
      this.saveCurrentAnswer();
      this.currentStep--;
      this.renderQuestion();
    }
  }

  nextQuestion() {
    this.saveCurrentAnswer();
    this.currentStep++;

    if (this.currentStep < QUESTIONS.length) {
      this.renderQuestion();
    } else {
      this.goToSubmission();
    }
  }

  saveCurrentAnswer() {
    const question = QUESTIONS[this.currentStep];
    if (question.type === 'radio') {
      // Radio answers stored separately as 'level'
    } else {
      this.answers[this.currentStep + 1] = this.questionInput.value.trim();
    }
  }

  goToSubmission() {
    this.showScreen('submission');
    this.emailInput.focus();
  }

  async submitForm(e) {
    e.preventDefault();

    const email = this.emailInput.value.trim();
    if (!email) {
      alert('Please enter your email address.');
      return;
    }

    this.btnSubmit.style.display = 'none';
    this.submissionLoading.style.display = 'block';
    this.submissionError.style.display = 'none';

    try {
      const response = await fetch('/impact-logic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: this.answers,
          level: this.level,
          email: email,
          shareWithJess: this.shareCheckbox.checked
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        this.showThankYou();
      } else {
        this.showSubmissionError();
      }
    } catch (error) {
      console.error('Submission error:', error);
      this.showSubmissionError();
    }
  }

  showSubmissionError() {
    this.submissionLoading.style.display = 'none';
    this.submissionError.style.display = 'block';
    this.btnSubmit.style.display = 'inline-block';
  }

  showThankYou() {
    this.showScreen('thankYou');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Mobile nav toggle
function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  new ImpactLogicForm();
});
