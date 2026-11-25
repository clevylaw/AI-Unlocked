window.QUESTIONS = [
  {
    id: "use", q: "How often do you use AI tools like ChatGPT, Claude or Gemini?",
    opts: ["Never, or I'm not sure I have", "I've tried one a few times", "Every week", "Every day, or I build things with them"],
    phrase: ["are new to AI tools", "have tried AI a few times", "use AI every week", "use AI every day"]
  },
  {
    id: "tech", q: "How would you describe your technical background?",
    opts: ["Not technical: I stick to the basics on computers and phones", "Comfortable with computers and apps", "Some technical skills, like spreadsheet formulas or a little coding", "Technical: I write code or work in IT, data or engineering"],
    phrase: ["prefer non-technical explanations", "are comfortable with computers", "have some technical skills", "have a technical background"]
  },
  {
    id: "goal", q: "What do you most want from this course?",
    opts: ["Understand what AI is and why it matters", "Use AI confidently in everyday life", "Use AI to do my job better", "Understand how AI works under the hood, or build with it"],
    phrase: ["understand what AI is", "use AI in everyday life", "use AI at work", "understand how AI works or build with it"]
  },
  {
    id: "time", q: "How much time do you have per sitting?",
    opts: ["About 10 minutes", "About 20 minutes", "45 minutes or more"],
    minutes: [10, 20, 45]
  }
];

window.PATHS = {
  starter: {
    name: "Starting from zero",
    summary: "The full beginner course, in order. Every idea is explained from scratch, with no jargon.",
    steps: ["1-1", "1-2", "1-3", "2-1", "2-2", "2-3", "3-1", "3-2", "3-3", "3-4", "4-1", "4-2", "4-3", "5-1", "5-2", "5-3", "6-1", "6-2", "6-3"]
  },
  everyday: {
    name: "Everyday AI",
    summary: "Skips the very basics and focuses on using chatbots and creative tools well, and safely, in daily life.",
    steps: ["1-3", "2-1", "2-2", "2-3", "3-1", "3-2", "3-3", "3-4", "4-1", "4-2", "5-2", "6-1", "6-2", "6-3"]
  },
  work: {
    name: "AI at work",
    summary: "Practical skills for your job: getting good answers, choosing tools, using AI for writing and analysis, and staying within the rules.",
    steps: ["1-3", "3-1", "3-2", "3-3", "3-4", "4-1", "4-3", "2-1", "2-3", "5-1", "5-2", "5-3", "6-1"]
  },
  builder: {
    name: "Under the hood",
    summary: "For technical learners: how models work, how they're trained, and how to build with APIs, retrieval, tools and agents.",
    steps: ["1-3", "3-1", "7-1", "7-2", "3-4", "3-2", "7-3", "6-1", "7-4", "3-3", "5-1", "5-2", "6-3"]
  }
};

window.choosePath = function (a) {
  const [use, tech, goal] = a;
  if (goal === 3 || tech === 3 || (tech === 2 && use >= 2)) return "builder";
  if (use === 0 && tech <= 1) return "starter";
  if (goal === 2) return "work";
  if (goal === 0 && use <= 1 && tech <= 1) return "starter";
  return "everyday";
};
