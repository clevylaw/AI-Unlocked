window.MODULES.push(
  {
    id: 4, icon: "wrench", color: "coral", level: "Practical",
    title: "AI tools in practice",
    desc: "Hands-on ways to use AI for writing, learning and work, with prompts you can copy and try right away.",
    recap: [
      "Use AI to draft, then rewrite in your own voice.",
      "Ask AI to explain things at your level and to quiz you.",
      "At work, check your employer's AI policy before pasting in anything confidential."
    ],
    lessons: [
      {
        title: "AI for writing", time: 7,
        intro: "AI can make you a faster, clearer writer without replacing your ideas.",
        content: `
<h3>Get past the blank page</h3>
<p>The hardest part of writing is starting. AI is excellent at producing a first draft you can react to, and at editing, restructuring and adjusting tone.</p>
<h3>Practical uses</h3>
<ul>
<li><strong>First drafts:</strong> describe what you need, let AI draft it, then rewrite it in your words.</li>
<li><strong>Editing:</strong> paste your draft and ask it to "make this shorter", "fix the grammar" or "make it more professional".</li>
<li><strong>Tone:</strong> "Make this warmer and less formal" or "make this more direct".</li>
<li><strong>Emails:</strong> list the points you need to make and let AI turn them into a clear message.</li>
</ul>
<div class="example-box"><div class="ex-label">A strong writing prompt</div><p>"I need to write a performance review for a team member who did great work this year but often misses deadlines. I want to be honest but encouraging. Here are my notes: [your notes]. Draft three short paragraphs in a warm, direct tone."</p></div>
<h3>Keep your own voice</h3>
<p>The most common mistake is sending AI text unchanged. It often sounds generic. Rewrite sentences in your own words, add specific examples only you know, and cut anything that doesn't sound like you.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Turn these notes into a friendly, short email to my neighbor: borrowed ladder last week, returning it Saturday morning, thank you, offer to help with their garden fence." },
        quiz: { q: "What's the best way to use AI for writing?", opts: ["Send AI output exactly as written", "Use AI for a draft, then rewrite it in your own voice", "Only use it to check spelling", "Avoid it, because it's always cheating"], correct: 1, feedback: "AI drafts are a starting point. Rewriting in your voice and adding your own specifics makes the result accurate and authentic." }
      },
      {
        title: "AI for learning", time: 7,
        intro: "AI can be a patient tutor that's available any time. Here's how to use it well.",
        content: `
<h3>Explanations at your level</h3>
<p>Tell the AI what you already know and what confuses you. It will adjust the explanation to fit.</p>
<div class="example-box"><div class="ex-label">A strong learning prompt</div><p>"I'm new to investing. I know what stocks and bonds are, but I don't get the difference between an index fund and an ETF. Explain it simply with an everyday analogy."</p></div>
<h3>Teach it back</h3>
<p>You really understand something when you can explain it simply. Explain a topic to the AI in your own words, then ask it to point out mistakes or gaps. This "teach it back" method is one of the most effective ways to learn.</p>
<h3>Practice questions</h3>
<p>Ask the AI to quiz you: "Give me 5 multiple-choice questions on the French Revolution at a high-school level, one at a time, and tell me if I'm right." Ask for explanations of the ones you miss.</p>
<h3>Study tools built for this</h3>
<p>Some tools are designed for learning from your own material. Google's Gemini Notebook (called NotebookLM until mid-2026), for example, answers questions using only the documents you upload and can turn them into a spoken summary.</p>
<p>For important subjects, double-check facts against a textbook or trusted site. AI speeds up learning; it doesn't replace reliable sources.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Quiz me on what I've learned about AI so far. Ask 5 questions, one at a time, wait for my answer, then tell me if I'm right and why." },
        quiz: { q: "What is the \"teach it back\" method?", opts: ["Reading AI notes the night before a test", "Explaining a topic to the AI in your own words, then asking it to find gaps", "Having AI write your flashcards", "Asking AI to summarize a whole textbook"], correct: 1, feedback: "Explaining something yourself reveals what you don't yet understand. The AI then points out the gaps." }
      },
      {
        title: "AI at work", time: 7,
        intro: "How AI is changing everyday work, and how to use it without getting into trouble.",
        content: `
<h3>Useful at almost any job</h3>
<ul>
<li><strong>Meeting prep:</strong> paste the agenda and ask what questions or concerns each person is likely to raise.</li>
<li><strong>Summaries:</strong> turn a long report into five key points.</li>
<li><strong>Spreadsheets:</strong> describe what you need and ask for the formula.</li>
<li><strong>Presentations:</strong> describe your message and audience, and ask for an outline.</li>
<li><strong>Job hunting:</strong> tailor your CV and cover letter to a specific job ad.</li>
</ul>
<div class="callout"><strong>Important</strong>Many employers have rules about which AI tools you may use and what you may paste into them. Never put confidential client details, private personal data or company secrets into a public chatbot without checking your organization's policy first.</div>
<h3>AI assistants built into work apps</h3>
<p>Microsoft 365, Google Workspace, Zoom, Slack and Notion now include AI assistants that summarize meetings, draft documents and search your files. If your employer provides these, they are usually the safest choice for work data.</p>
<h3>Staying valuable</h3>
<p>People who learn to use AI well can work faster and take on more. Skills AI can't easily replace, such as judgment, relationships, deep expertise and taste, become even more valuable.</p>`,
        tryIt: { tool: "ChatGPT, Claude, Gemini or Copilot", prompt: "In a spreadsheet, column A has dates and column B has sales amounts. Write a formula that totals sales for March 2026 only, and explain each part in plain English." },
        quiz: { q: "What should you check before pasting work documents into an AI tool?", opts: ["Whether the AI is fast enough", "Your organization's AI and data policy", "Whether the document is too long", "The AI's training cutoff date"], correct: 1, feedback: "Your employer's policy decides which tools are allowed and what data may go into them. Pasting confidential information into the wrong tool can break privacy agreements." }
      }
    ]
  },
  {
    id: 5, icon: "shield", color: "crimson", level: "Intermediate",
    title: "AI safety & ethics",
    desc: "The real concerns about AI, including bias, privacy and jobs, explained honestly and without hype.",
    recap: [
      "AI can repeat unfair patterns from its training data, which matters most in decisions about people.",
      "Never share passwords, ID numbers or other people's private information with a chatbot; check privacy settings.",
      "Routine tasks are most affected by AI; judgment, care and creativity are least affected."
    ],
    lessons: [
      {
        title: "Bias in AI", time: 5,
        intro: "AI can be unfair without anyone intending it. Here's why, and why it matters.",
        content: `
<h3>Where bias comes from</h3>
<p>AI learns from data made by people. That data reflects our history, unfair parts included. If an AI learns from one-sided examples, it picks up the same slant. Then it repeats it for many people at once.</p>
<div class="example-box"><div class="ex-label">Real-world examples</div><p>A hiring tool learned from past hiring and favored men for tech jobs, because more men had been hired before. Some face-recognition tools made more mistakes with darker skin. They had learned mostly from lighter-skinned faces.</p></div>
<h3>Why it matters</h3>
<p>AI now helps decide who gets a job interview, a loan or medical care. If it's biased, real people get hurt. It can also be harder to argue with than a person, because you can't always see how it decided.</p>
<h3>What's being done</h3>
<p>Researchers test AI for unfair results and find ways to fix them. New laws, like the European Union's AI Act, require extra checks when AI is used for big decisions about people. If AI played a part in an important decision about you, you can often ask how it was made.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Give me three questions I could ask a company if I suspect an AI system was involved in rejecting my loan or job application." },
        quiz: { q: "Why do AI systems become biased?", opts: ["Programmers add bias on purpose", "Hardware faults cause random errors", "They learn from human-made data that reflects existing unfairness", "Biased answers use less computing power"], correct: 2, feedback: "Bias comes mostly from training data. The AI learns the patterns it's shown, fair or not." }
      },
      {
        title: "Privacy and your data", time: 5,
        intro: "What happens to what you type into an AI tool, and how to protect yourself.",
        content: `
<h3>Your chats may be kept and used</h3>
<p>What you type into a chatbot may be kept. Depending on the app and your settings, it may be read to check for safety problems, or used to train future AI. That can include health worries, money problems or personal details.</p>
<div class="callout"><strong>What to do</strong>Open the privacy settings in each AI app you use. Most let you stop your chats being used for training, start a temporary chat that isn't saved, or delete your history.</div>
<h3>Never share</h3>
<ul>
<li>Passwords, PINs or security codes</li>
<li>Bank, card or government ID numbers</li>
<li>Other people's private information without their permission</li>
<li>Your employer's confidential information</li>
</ul>
<h3>Work and school accounts</h3>
<p>Paid plans for businesses and schools usually protect your data better. For example, they often promise not to train AI on it. If your workplace gives you one, use it for work tasks.</p>`,
        tryIt: { tool: "The AI app you use most", prompt: "Open its settings and find: (1) whether your chats are used for training, (2) how to start a temporary or private chat, and (3) how to delete your history. If you can't find them, ask the chatbot: \"Where are your privacy and data settings, and what do they control?\"" },
        quiz: { q: "Which is a smart habit with AI chat tools?", opts: ["Share lots of personal detail so it can help more", "Check privacy settings and keep sensitive data out", "Assume every chat is private by default", "Stop using AI altogether"], correct: 1, feedback: "Knowing your settings and keeping sensitive data out lets you get the benefits while limiting the risk." }
      },
      {
        title: "AI and the future of work", time: 5,
        intro: "Will AI take your job? A balanced look at what's happening.",
        content: `
<h3>What we know</h3>
<p>Experts don't agree on how big the change will be. Some think many jobs will disappear. Others think AI will change most jobs and create new ones, as past inventions did. Almost all agree that many jobs are already changing.</p>
<div class="callout"><strong>History helps, a little</strong>The printing press, factory machines and the internet each ended some jobs and created others. But the change was often hard on the people it hit. New jobs don't always appear quickly, or in the same places.</div>
<h3>Most and least affected</h3>
<p><strong>Most affected:</strong> everyday computer tasks, like typing in data, simple writing, basic number work, some customer service and translation.</p>
<p><strong>Least affected:</strong> hands-on skilled work (plumbers, electricians), caring work (nurses, therapists), and work that depends on judgment, trust and leading people.</p>
<h3>How to prepare</h3>
<ul>
<li>Get comfortable using AI tools for parts of your own job.</li>
<li>Build skills AI finds hard: judgment, people skills, deep expertise and creativity.</li>
<li>Keep learning. Courses like this one are a good start.</li>
</ul>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "My job is [describe your job in two sentences]. Which of my tasks could AI help with today, which are unlikely to change, and what one skill should I build next?" },
        quiz: { q: "Which kind of work is AI affecting most right now?", opts: ["Skilled physical work like plumbing", "Care work like nursing", "Routine computer tasks like data entry and basic writing", "Leadership and decision-making"], correct: 2, feedback: "Repetitive computer-based tasks are easiest to automate. Physical, caring and judgment-heavy work is much less affected." }
      }
    ]
  },
  {
    id: 6, icon: "compass", color: "plum", level: "Intermediate",
    title: "What's next in AI",
    desc: "AI agents that do tasks for you, AI that sees and speaks, AI in science, and how to keep up.",
    recap: [
      "AI agents carry out multi-step tasks, so check what they're allowed to do.",
      "Multimodal AI works with text, images, audio and video together.",
      "Keep up by using the tools and following one or two trusted sources."
    ],
    lessons: [
      {
        title: "AI agents", time: 5,
        intro: "AI is moving from answering questions to doing tasks. Meet AI agents.",
        content: `
<h3>Beyond chat</h3>
<p>A chatbot answers. An <strong>AI agent</strong> acts: it takes a goal, breaks it into steps, uses tools like a web browser or a code editor, checks its work, and keeps going until the task is done.</p>
<div class="callout"><strong>Example</strong>"Find three flights to Rome under $600 in May, compare them in a table, and draft an email to my partner with the best option." An agent can do all of that, asking you only for decisions.</div>
<h3>Agents you can use today</h3>
<ul>
<li><strong>Computer use:</strong> assistants from OpenAI, Anthropic and Google can operate a web browser, clicking, typing and filling in forms to finish a task.</li>
<li><strong>Coding agents:</strong> tools such as Claude Code, OpenAI Codex, GitHub Copilot and Cursor can build and fix software from a plain-English request.</li>
<li><strong>Research agents:</strong> "deep research" modes in ChatGPT, Gemini and Claude spend several minutes reading dozens of sources and write a report with citations.</li>
</ul>
<h3>Stay in charge</h3>
<p>An agent that can send emails, spend money or delete files needs limits. Good agents ask before important actions. Give them only the access a task needs, and review what they did.</p>`,
        tryIt: { tool: "A chatbot with a research mode (ChatGPT, Gemini or Claude)", prompt: "Research the three most beginner-friendly hobbies for someone who wants to spend less time on screens. For each, give the cost to start, time needed per week, and a reliable source." },
        quiz: { q: "What's the main difference between a chatbot and an AI agent?", opts: ["Agents are always smarter", "Agents can take actions and use tools to complete multi-step tasks", "Agents are only for businesses", "Agents need longer prompts"], correct: 1, feedback: "Agents act: they browse, run code and use apps to reach a goal, rather than only replying with text." }
      },
      {
        title: "AI that sees, hears and speaks", time: 5,
        intro: "Today's AI works with photos, voice and video, not just text.",
        content: `
<h3>Multimodal AI</h3>
<p><strong>Multimodal</strong> means working with several kinds of information at once: text, images, sound and video. Most leading AI models are now multimodal.</p>
<div class="example-box"><div class="ex-label">Try these with your phone's camera</div><p>Photograph a math problem and ask for a step-by-step explanation. Photograph your fridge and ask what you could cook. Photograph a confusing form or bill and ask what it means.</p></div>
<h3>Talking out loud</h3>
<p>Voice modes in ChatGPT, Gemini and other apps let you have a natural spoken conversation. The AI responds within a second or so, and you can interrupt it like a person. Some can also see through your camera while you talk.</p>
<h3>AI in science</h3>
<p>Some of AI's biggest effects are in research. DeepMind's AlphaFold predicted the 3D shapes of hundreds of millions of proteins, work that earned a share of the 2024 Nobel Prize in Chemistry. AI is now speeding up drug discovery, materials research and weather forecasting.</p>`,
        tryIt: { tool: "The ChatGPT, Gemini or Claude phone app", prompt: "Take a photo of something around you (a plant, a label, a gadget) and ask: \"What is this, and what's one interesting fact about it?\"" },
        quiz: { q: "What does \"multimodal AI\" mean?", opts: ["AI that runs on many computers", "AI that works with several kinds of information, like text, images and audio", "AI with multiple personalities", "AI that speaks many languages"], correct: 1, feedback: "Multimodal AI combines text, images, audio and video, so you can show it a photo and ask about it, or talk to it out loud." }
      },
      {
        title: "Keeping up", time: 5,
        intro: "AI changes fast. Here's how to stay informed without feeling overwhelmed.",
        content: `
<h3>The pace of change</h3>
<p>In a few years AI went from barely writing a paragraph to writing software, holding spoken conversations and making realistic video. New models arrive every few months. What's impressive today will be ordinary next year.</p>
<h3>A simple routine</h3>
<ul>
<li><strong>Pick one or two sources</strong> and check them weekly, for example MIT Technology Review, The Verge's AI section, or a newsletter you trust.</li>
<li><strong>Use the tools.</strong> Ten minutes trying a new feature teaches more than an hour of reading about it.</li>
<li><strong>Check back here.</strong> This site's Tools and Models sections are refreshed every week.</li>
</ul>
<div class="callout"><strong>A healthy mindset</strong>Nobody knows everything about AI. Understanding the core ideas from this course and practicing with the tools that matter to you is enough to stay ahead.</div>
<h3>You've finished the course</h3>
<p>You now know what AI is, how generative AI and chatbots work, how to choose a model, how to use AI for writing, learning and work, the real risks, and where things are heading. Keep experimenting and stay curious.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Based on my interests in [your interests], suggest one AI tool I haven't tried and a 15-minute first project I could do with it this week." },
        quiz: { q: "What's the most effective way to keep up with AI?", opts: ["Read every AI news story", "Use the tools regularly and follow one or two trusted sources", "Follow every AI researcher online", "Wait until things settle down"], correct: 1, feedback: "Hands-on use builds real understanding, and a couple of trusted sources keep you informed without overload." }
      }
    ]
  }
);

window.GLOSSARY = [
  { term: "Artificial intelligence (AI)", def: "Computer systems that do tasks that normally need human intelligence, like recognizing speech, making decisions or writing text." },
  { term: "AI model", def: "The trained AI engine that does the work inside an app. ChatGPT is an app; GPT models are the models inside it." },
  { term: "Machine learning", def: "A way of building AI that learns from examples instead of following hand-written rules. The more good examples, the better it gets." },
  { term: "Deep learning", def: "A powerful kind of machine learning that uses neural networks with many layers to find complex patterns." },
  { term: "Neural network", def: "Layers of simple calculations, loosely inspired by the brain, that together turn an input (like a photo) into an output (like \"cat\")." },
  { term: "Large language model (LLM)", def: "An AI trained on huge amounts of text that can write, summarize, translate and hold conversations. It powers chatbots." },
  { term: "Chatbot", def: "An app you talk to in plain language, such as ChatGPT, Claude, Gemini or Copilot." },
  { term: "Generative AI", def: "AI that creates new content, such as text, images, audio, video or code, rather than only analyzing existing content." },
  { term: "Prompt", def: "The message or instructions you give an AI. Clear, specific prompts with context get better results." },
  { term: "Hallucination", def: "When an AI states something false as if it were fact, such as a made-up citation or a wrong date." },
  { term: "Training data", def: "The examples an AI learns from. Their quality and variety shape what the AI knows and what biases it carries." },
  { term: "Training", def: "The process of an AI learning from training data by guessing, checking and adjusting millions of times." },
  { term: "Parameters", def: "The adjustable numbers inside a model that store what it learned. Large models have billions of them." },
  { term: "Token", def: "A chunk of text, roughly a word or part of a word, that language models read and write. Usage limits are often counted in tokens." },
  { term: "Context window", def: "How much text an AI can consider at once, including your conversation and any documents. Larger windows handle longer material." },
  { term: "Reasoning model", def: "A model, or a \"thinking\" mode, that works through a problem step by step before answering. Slower, but better at hard tasks." },
  { term: "Multimodal AI", def: "AI that works with several kinds of information, such as text, images, audio and video, often together." },
  { term: "AI agent", def: "An AI that takes actions toward a goal, such as browsing the web, filling in forms or writing code, not just replying with text." },
  { term: "Diffusion model", def: "The kind of AI behind most image and video generators. It starts from random noise and refines it into a picture that matches your description." },
  { term: "Transformer", def: "The design behind almost all modern language models, introduced by Google researchers in 2017. It lets a model weigh every word against every other word." },
  { term: "Fine-tuning", def: "Extra training of an existing model on specialized examples so it gets better at a particular task or style." },
  { term: "Open model (open-weight)", def: "A model whose trained parameters are published so anyone can download, run and adapt it. Examples include Meta's Llama and models from Mistral and DeepSeek." },
  { term: "Retrieval-augmented generation (RAG)", def: "A technique where the AI first looks up relevant documents, then writes its answer from them. It reduces made-up facts." },
  { term: "Temperature", def: "A setting that controls how predictable or varied an AI's output is. Low is consistent; high is more creative and surprising." },
  { term: "AI bias", def: "When an AI produces unfair results for some groups, usually because of lopsided training data." },
  { term: "Deepfake", def: "A realistic fake image, video or voice recording of a real person, made with AI." },
  { term: "Content credentials", def: "A label attached to a file that records whether and how AI was used to make or edit it. Some cameras, apps and websites show it." },
  { term: "AGI (artificial general intelligence)", def: "A hypothetical AI that could do any intellectual task as well as a person. Experts disagree on whether and when it will arrive." }
];
