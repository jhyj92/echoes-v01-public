// Basic Echoes v0.2 Logic

const onboardingData = [
  {
    question: "Which of these do you most resonate with?",
    options: ["Strategy", "Creativity", "Empathy", "Courage"],
  },
  {
    question: "Choose a world you feel drawn to:",
    options: ["Fantasy (e.g., Empyrean)", "Sci-Fi (e.g., Mass Effect)", "Historical (e.g., Churchill era)", "Modern (e.g., Tech Pioneers)"],
  }
];

let currentQuestion = 0;
let selectedTraits = [];

function startOnboarding() {
  renderQuestion();
}

function renderQuestion() {
  const container = document.getElementById('onboarding');
  container.innerHTML = '';

  const q = document.createElement('h2');
  q.innerText = onboardingData[currentQuestion].question;
  container.appendChild(q);

  onboardingData[currentQuestion].options.forEach(option => {
    const btn = document.createElement('button');
    btn.innerText = option;
    btn.onclick = () => selectOption(option);
    container.appendChild(btn);
  });
}

function selectOption(option) {
  selectedTraits.push(option);
  currentQuestion++;

  if (currentQuestion < onboardingData.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const onboarding = document.getElementById('onboarding');
  const chat = document.getElementById('chat');

  onboarding.style.display = 'none';
  chat.style.display = 'block';

  const result = document.createElement('h2');
  result.innerText = `You are matched with the world of ${selectedTraits[1]} and the trait of ${selectedTraits[0]}.`;

  const intro = document.createElement('p');
  intro.innerText = `Your journey begins now... (future real hero conversations will load here)`;

  chat.appendChild(result);
  chat.appendChild(intro);
}

startOnboarding();
