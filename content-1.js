window.MODULES = [
  {
    id: 1, icon: "bulb", color: "violet", level: "Beginner",
    title: "What is AI?",
    desc: "What artificial intelligence actually is, what it can and can't do, and why everyone is suddenly talking about it.",
    recap: [
      "AI is software that learns patterns from examples instead of following hand-written rules.",
      "It makes predictions and decisions, but it has no feelings, opinions or awareness.",
      "AI, machine learning, deep learning and generative AI fit inside each other like nested boxes."
    ],
    lessons: [
      {
        title: "AI in plain English", time: 4,
        intro: "AI stands for Artificial Intelligence. Here is what that means in your daily life.",
        content: `
<h3>Start with what you already know</h3>
<p>You probably use AI every day. When your phone suggests the next word as you type, that's AI. When a streaming service recommends a show, that's AI. When your email moves spam into the junk folder, that's AI.</p>
<p>These examples have one thing in common: a computer is making a <strong>prediction</strong> or a <strong>decision</strong> based on patterns it learned from lots of examples.</p>
<div class="callout"><strong>Key idea</strong>Artificial Intelligence is any computer system that does tasks that normally need human intelligence, like recognizing faces, understanding language or making predictions.</div>
<h3>What AI is not</h3>
<p>AI is not a robot that thinks like a person. It has no feelings, opinions or awareness. It is a very powerful pattern-matching and prediction machine. That is impressive, but it is a different thing from human thinking.</p>
<div class="example-box"><div class="ex-label">Real example</div><p>A spam filter doesn't "know" an email is a scam. It learned, from millions of examples, which words and patterns tend to show up in scams, and it spots those patterns.</p></div>
<h3>Why now?</h3>
<p>AI has existed for decades. Three things changed in the last fifteen years and made it far more capable:</p>
<ul>
<li><strong>Huge amounts of data.</strong> The internet produced billions of pages, photos and videos for AI to learn from.</li>
<li><strong>Faster computer chips.</strong> Specialized chips made it possible to process that data quickly.</li>
<li><strong>Better methods.</strong> Researchers found new techniques, especially "deep learning", that learn far better from data.</li>
</ul>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "List 10 ways AI already shows up in an ordinary person's day, from waking up to going to bed. Keep each one to a single sentence and avoid technical words." },
        quiz: { q: "Which of these is an example of AI in everyday life?", opts: ["A light switch that turns on when you flip it", "A streaming service recommending a show based on what you've watched", "A calculator adding 2 + 2", "A stopwatch timing a race"], correct: 1, feedback: "The recommendation learns from your viewing history to predict what you'll like. The others follow fixed rules and learn nothing." }
      },
      {
        title: "How does AI learn?", time: 5,
        intro: "AI isn't given a rulebook. It learns from examples. Here's how that works.",
        content: `
<h3>Teaching by example</h3>
<p>A traditional computer program follows rules a person writes: "If the temperature is above 30°C, turn on the fan." Someone has to think of every rule in advance.</p>
<p>AI works differently. Instead of rules, you give it thousands of examples: "Here are 10,000 photos of cats and 10,000 photos of other things." The AI works out for itself what makes a cat a cat.</p>
<div class="callout"><strong>Analogy</strong>Nobody gave you a rulebook for reading handwriting. You saw the letter "A" written many different ways, and your brain learned what makes an A. AI learns in a similar way.</div>
<h3>Training data</h3>
<p>The examples an AI learns from are called <strong>training data</strong>. Their quality matters enormously. An AI trained mostly on English text is better at English than other languages. An AI trained on photos from one part of the world may recognize faces from elsewhere less well.</p>
<p>This is why AI can be <strong>biased</strong>. If the examples it learned from are unfair or lopsided, and human-made data often is, the AI picks that up too.</p>
<h3>Practice makes better</h3>
<p>During <strong>training</strong>, the AI makes a guess, checks whether it was right, adjusts itself slightly, and tries again, millions of times. Each small correction makes the next guess a little better. No one writes the rules; they emerge from all that practice.</p>
<div class="example-box"><div class="ex-label">Real example</div><p>A self-driving car's AI studies millions of hours of driving footage. It learns that when a person steps off the curb, the car should slow down. No programmer wrote that rule; the AI picked it up from examples.</p></div>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Explain how an AI learns to tell cats from dogs, as if you were talking to a curious 10-year-old. Use one everyday analogy." },
        quiz: { q: "What is \"training data\"?", opts: ["A manual that teaches people how to use AI", "The examples an AI learns patterns from", "Private data that AI is never allowed to see", "How fast an AI processes information"], correct: 1, feedback: "Training data is the collection of examples an AI learns from. Better and more varied examples generally make a better AI." }
      },
      {
        title: "The family tree of AI", time: 6,
        intro: "You'll hear many names: machine learning, deep learning, generative AI. Here's how they fit together.",
        content: `
<h3>One picture explains it</h3>
<p>These terms aren't competitors. Each one sits inside the one before it.</p>
<figure class="viz">
<svg viewBox="0 0 520 300" role="img" aria-label="Nested boxes: Artificial Intelligence contains Machine Learning, which contains Deep Learning, which contains Generative AI">
<rect class="nv nv-1" x="6" y="6" width="508" height="288" rx="22"/>
<rect class="nv nv-2" x="46" y="52" width="428" height="236" rx="20"/>
<rect class="nv nv-3" x="86" y="98" width="348" height="184" rx="18"/>
<rect class="nv nv-4" x="126" y="144" width="268" height="132" rx="16"/>
<text class="nv-t" x="260" y="36" text-anchor="middle">Artificial Intelligence</text>
<text class="nv-t" x="260" y="82" text-anchor="middle">Machine Learning</text>
<text class="nv-t" x="260" y="128" text-anchor="middle">Deep Learning</text>
<text class="nv-t" x="260" y="180" text-anchor="middle">Generative AI</text>
<text class="nv-s" x="260" y="206" text-anchor="middle">ChatGPT, Claude, Gemini,</text>
<text class="nv-s" x="260" y="226" text-anchor="middle">Midjourney, Suno</text>
</svg>
<figcaption>Each idea is a more specific kind of the one around it.</figcaption>
</figure>
<h3>Artificial Intelligence</h3>
<p>The big idea: computers doing tasks that seem to need intelligence.</p>
<h3>Machine Learning</h3>
<p>The main way modern AI is built: learning patterns from examples, as you saw in the last lesson. When people say "AI" today, they usually mean machine learning.</p>
<h3>Deep Learning</h3>
<p>A powerful kind of machine learning, loosely inspired by the brain. It uses <strong>neural networks</strong>, many layers of simple calculations stacked together, to find very complex patterns. It powers voice assistants, photo search and chatbots.</p>
<h3>Generative AI</h3>
<p>Deep learning that <strong>creates</strong> new things, such as text, images, music, code and video, instead of only sorting or labelling. This is the next module.</p>
<div class="callout"><strong>Narrow, not general</strong>Every AI you can use today is "narrow": very good at the tasks it was built and trained for. A machine that can do any intellectual task as well as a person, often called "general AI" or AGI, is a goal some companies are pursuing, and experts disagree on how close it is.</div>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "For each of these, tell me whether it's machine learning, generative AI, or not AI at all, and why in one sentence: a spam filter, a thermostat on a timer, an app that writes birthday poems, face unlock on a phone." },
        quiz: { q: "How does generative AI relate to machine learning?", opts: ["They are unrelated technologies", "Generative AI is one kind of machine learning (through deep learning)", "Machine learning is one kind of generative AI", "Generative AI replaced machine learning"], correct: 1, feedback: "Generative AI is built with deep learning, which is a kind of machine learning, which is one approach to AI. Each sits inside the one before." }
      }
    ]
  },
  {
    id: 2, icon: "sparkles", color: "magenta", level: "Beginner",
    title: "Generative AI",
    desc: "AI that creates text, images, music and video. What it is, how image AI works, and how to use it responsibly.",
    recap: [
      "Generative AI creates new text, images, audio, video and code from a description.",
      "Image AI starts from random noise and refines it step by step toward your description.",
      "Check a tool's terms before commercial use, be open about AI use, and verify images before sharing them."
    ],
    lessons: [
      {
        title: "What generative AI creates", time: 5,
        intro: "Generative AI can produce text, images, music, code and video. Here's a tour.",
        content: `
<h3>A new kind of AI</h3>
<p>Earlier AI mostly analyzed things: is this email spam, is this photo a cat? Generative AI <strong>makes</strong> things. Describe what you want, and it produces something new.</p>
<div class="callout"><strong>Key idea</strong>Generative AI creates original content based on patterns it learned from enormous amounts of human-made content.</div>
<h3>What it can make</h3>
<div class="kinds">
<div><strong>Text</strong><span>Emails, stories, summaries, translations. ChatGPT, Claude, Gemini.</span></div>
<div><strong>Images</strong><span>Photos, illustrations, logos from a description. Midjourney, Ideogram, Adobe Firefly, and image tools built into ChatGPT and Gemini.</span></div>
<div><strong>Audio</strong><span>Natural voiceovers and full songs. ElevenLabs, Suno.</span></div>
<div><strong>Video</strong><span>Short clips from text or a photo. Google Veo, OpenAI Sora, Runway, Kling.</span></div>
<div><strong>Code</strong><span>Working programs from plain-English requests. GitHub Copilot, Cursor, Claude Code.</span></div>
</div>
<h3>Why it matters</h3>
<p>Making professional-quality writing, design, music or software used to take years of training. Generative AI lets anyone produce a first draft of almost anything in seconds. It doesn't replace skill and taste, but it gives everyone a strong starting point.</p>`,
        tryIt: { tool: "ChatGPT, Gemini or Claude", prompt: "Write a 4-line poem about my morning coffee. Then write it again in the style of a pirate, and again as a news headline." },
        quiz: { q: "Which of these is generative AI?", opts: ["A spam filter blocking junk email", "An app that writes a poem from your description", "Face recognition unlocking your phone", "A map app finding the fastest route"], correct: 1, feedback: "Writing a poem creates something new. The others analyze or sort existing information." }
      },
      {
        title: "How image AI works", time: 5,
        intro: "How does AI turn \"a golden retriever in sunglasses on a beach\" into a picture?",
        content: `
<h3>From static to picture</h3>
<p>Most image AI uses a method called <strong>diffusion</strong>. During training, the AI takes real images and adds random speckles, like TV static, until nothing is left but noise. Then it practices the reverse: turning noise back into a clear picture, a little at a time.</p>
<div class="callout"><strong>Analogy</strong>Imagine watching a sandcastle wash away, frame by frame, millions of times. Eventually you could play the film backwards and build a castle out of loose sand. Image AI learned to build pictures out of noise the same way.</div>
<h3>Where your words come in</h3>
<p>When you type a description, a language model turns your words into guidance. The image AI then cleans up the noise step by step, steering toward a picture that matches what you wrote. The result is new, though it is shaped by the millions of images the AI studied.</p>
<h3>Why you get a different image each time</h3>
<p>Each attempt starts from different random noise, so the same description gives different pictures. That's useful for exploring ideas: generate a few and keep the best.</p>
<div class="example-box"><div class="ex-label">What makes a good image description</div><p>Say what's in the picture, the style, the lighting and the mood. "A quiet waterfall in a dense Japanese forest, early morning light, watercolor style" gets far better results than "a waterfall".</p></div>`,
        tryIt: { tool: "ChatGPT or Gemini (both make images free)", prompt: "Create an image of a cozy reading nook by a rainy window, warm lamp light, watercolor style. Then make a second version in the style of a 1950s travel poster." },
        quiz: { q: "How does a diffusion image model create a picture?", opts: ["It searches the web and copies a matching image", "It starts from random noise and refines it step by step toward your description", "It traces over an existing artwork", "It blends two photos together"], correct: 1, feedback: "Diffusion models start from random noise and clean it up gradually, guided by your description, until a picture appears." }
      },
      {
        title: "Using it responsibly", time: 5,
        intro: "Generative AI is powerful. A few things to know before you create and share.",
        content: `
<h3>Who owns AI-made content?</h3>
<p>Courts and governments are still deciding. In several countries, work made entirely by AI can't be copyrighted, and lawsuits about how AI companies used training data are ongoing. Before using AI output in a business, read the tool's terms of service.</p>
<h3>Deepfakes</h3>
<p>AI can make convincing fake photos, voices and videos of real people. It has good uses, like film effects and restoring voices for people who lost theirs, but it's also used for scams and misinformation.</p>
<div class="callout"><strong>Before you share an image or video</strong>AI images are now realistic enough that "look at the hands" no longer works reliably. Instead, check where it came from, look for a "Made with AI" or content-credentials label, and search for the same story on a trusted news site.</div>
<h3>Scam calls using cloned voices</h3>
<p>A few seconds of audio is enough to imitate someone's voice. Agree on a family "safe word" to use if someone calls asking urgently for money.</p>
<h3>Environmental cost</h3>
<p>Training and running large AI models uses a lot of electricity, and data centers use water for cooling. Using AI thoughtfully, rather than generating a hundred versions of everything, is a small way to reduce that.</p>
<h3>Be open about AI use</h3>
<p>When AI helped make something for work or school, saying so builds trust. Many schools and employers now have rules about this, so check yours.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "I received a voice message from a 'relative' asking me to send money urgently. Give me a short checklist to tell whether it might be an AI voice scam." },
        quiz: { q: "What's the most reliable way to check a suspicious image before sharing it?", opts: ["Look closely at the hands", "Check where it came from and whether trusted sources report the same thing", "Ask whether it looks too good to be true", "Zoom in on the background"], correct: 1, feedback: "Visual tells are becoming unreliable as image AI improves. Checking the source and confirming with trusted outlets works much better." }
      }
    ]
  },
  {
    id: 3, icon: "chat", color: "berry", level: "Beginner",
    title: "Chatbots & AI models",
    desc: "How ChatGPT, Claude and Gemini actually work, how to talk to them, when not to trust them, and how to choose between models.",
    recap: [
      "A language model writes by predicting the next word, over and over.",
      "Clear, specific prompts with context get much better answers.",
      "Chatbots can state wrong facts confidently, so verify anything important.",
      "Different models suit different jobs: big ones for hard problems, small ones for quick tasks."
    ],
    lessons: [
      {
        title: "What is a language model?", time: 6,
        intro: "Chatbots like ChatGPT, Claude and Gemini run on large language models. Here's what they do.",
        content: `
<h3>Predicting the next word</h3>
<p>At its core, a language model does one thing: given some text, it predicts what word comes next. Then it adds that word and predicts again. Do this billions of times during training, on a huge amount of writing, and the model gets remarkably good at producing useful text.</p>
<p>Try it below. The bars show how likely the model thinks each next word is.</p>
<div data-demo="nextword"></div>
<div class="callout"><strong>Analogy</strong>Your phone's keyboard suggests the next word. A large language model does the same thing, but it learned from a large share of everything ever written, and it keeps the whole conversation in mind as it writes.</div>
<h3>What "large" means</h3>
<p>A model stores what it learned as billions of adjustable numbers called <strong>parameters</strong>. The biggest models have hundreds of billions or more; companies rarely publish exact counts. More parameters generally means more knowledge and skill, but also more cost to run.</p>
<h3>What they learn from</h3>
<p>Books, websites, encyclopedias, code, scientific papers and forums. That's why chatbots know a bit about almost everything.</p>
<h3>Understanding, or not?</h3>
<p>Researchers still debate how much these models "understand". What matters for you: they produce text that <em>sounds</em> right based on patterns, which is usually helpful and occasionally wrong. Your judgment still matters.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Finish this sentence five different ways, from most predictable to most surprising: \"When I opened the fridge, I found...\"" },
        quiz: { q: "At its most basic level, what does a language model do?", opts: ["Looks up answers in a database", "Predicts what word should come next, again and again", "Copies sentences from websites", "Translates everything into code first"], correct: 1, feedback: "Language models predict the next word (or piece of a word), add it, and repeat. Conversations, essays and code all come from doing that very well." }
      },
      {
        title: "Talking to a chatbot", time: 5,
        intro: "How you ask makes a huge difference. Here's how to get great answers.",
        content: `
<h3>Your words matter</h3>
<p>The message you type is called a <strong>prompt</strong>. Vague prompts get vague answers. Specific prompts get specific, useful ones.</p>
<div class="compare">
<div class="compare-col weak"><div class="compare-label">Vague prompt</div><p class="compare-prompt">"Tell me about diets."</p><div class="compare-label">Typical answer</div><p>A general overview of a dozen diet types, none tailored to you.</p></div>
<div class="compare-col strong"><div class="compare-label">Specific prompt</div><p class="compare-prompt">"I'm 45, want to lose 5 kg over 3 months, and don't want to cut out bread. Suggest a simple eating plan and explain why it works."</p><div class="compare-label">Typical answer</div><p>A concrete weekly plan that fits your goal and limits, with the reasoning spelled out.</p></div>
</div>
<h3>A simple recipe for good prompts</h3>
<ul>
<li><strong>Who you are</strong> and what you already know.</li>
<li><strong>What you want</strong>: the task, as specifically as you can.</li>
<li><strong>Your limits</strong>: length, tone, budget, things to avoid.</li>
<li><strong>The format</strong>: a list, a table, an email, three options.</li>
</ul>
<h3>Keep the conversation going</h3>
<p>You don't need a perfect first prompt. Reply with "shorter", "more casual", "give me three other options" or "explain step 2". Chatbots remember the conversation, so refining is normal.</p>
<h3>Great at / weaker at</h3>
<p><strong>Great at:</strong> explaining things simply, drafting, brainstorming, summarizing long documents, rewriting in a different tone, translating, and writing code.</p>
<p><strong>Weaker at:</strong> very recent news (unless the chatbot searches the web), exact figures and citations, and knowing when it doesn't know something.</p>`,
        tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "I'm planning a 3-day trip to Lisbon in spring with two kids aged 8 and 11. We like food and history, not long museum visits. Suggest a day-by-day plan in a table with morning, afternoon and evening." },
        quiz: { q: "What is a \"prompt\"?", opts: ["A paid subscription plan", "The message or instructions you give the AI", "An error message from the AI", "The AI's training data"], correct: 1, feedback: "A prompt is what you type to the AI. The more context and detail it has, the better the answer usually is." }
      },
      {
        title: "When not to trust it", time: 5,
        intro: "Chatbots can say completely wrong things in a confident voice. Here's what to watch for.",
        content: `
<h3>What is a "hallucination"?</h3>
<p>A <strong>hallucination</strong> is when an AI states something false as if it were fact: a made-up book, a wrong date, a quote nobody said. It isn't lying. It produces the most likely-sounding text, and sometimes likely-sounding text is wrong.</p>
<div class="example-box"><div class="ex-label">Common examples</div><p>Invented citations ("A 2019 Harvard study found…" when no such study exists), wrong dates ("The Eiffel Tower was finished in 1854" when it was 1889), quotes attributed to real people who never said them.</p></div>
<p>Hallucinations have become less common as models improve, and chatbots that search the web and show their sources are easier to check. They have not disappeared.</p>
<h3>Protect yourself</h3>
<ul>
<li><strong>Verify anything important</strong> with a trusted source, especially medical, legal and financial information.</li>
<li><strong>Be extra careful with specifics</strong>: numbers, names, dates and citations are where errors hide.</li>
<li><strong>Click the sources</strong> when a chatbot gives them, and check they say what the AI claims.</li>
<li><strong>Use AI for structure and drafts</strong>, then fill in facts you have confirmed.</li>
</ul>
<div class="callout"><strong>Rule of thumb</strong>Treat a chatbot like a very well-read colleague who sometimes misremembers details. Great for ideas and drafts; double-check before anything important goes out.</div>`,
        tryIt: { tool: "A chatbot with web search, such as ChatGPT, Gemini or Perplexity", prompt: "What are three well-supported health benefits of walking 30 minutes a day? Give a source link for each one." },
        quiz: { q: "A chatbot gives you a specific statistic. What should you do?", opts: ["Trust it, since AI is always accurate", "Check it against a reliable source before using it", "Use it only if the AI sounded confident", "Ignore every number an AI gives you"], correct: 1, feedback: "Specific numbers and citations are where hallucinations most often hide, and confidence is no guide. Check before relying on them." }
      },
      {
        title: "Choosing an AI model", time: 7,
        intro: "ChatGPT, Claude and Gemini each offer several models. Here's how to tell them apart and pick one.",
        content: `
<h3>App vs. model</h3>
<p>The <strong>app</strong> is what you use: ChatGPT, Claude, Gemini, Copilot. The <strong>model</strong> is the AI engine inside it, and most apps let you switch between several. Companies release new models every few months, which is why names keep changing.</p>
<h3>Big, medium and small</h3>
<p>Most companies sell a family of models in different sizes:</p>
<div class="model-tiers">
<div><strong>Large</strong><span>Smartest and slowest. Best for hard problems, long documents and careful writing. Often limited on free plans.</span></div>
<div><strong>Medium</strong><span>The everyday default. Fast and capable enough for most tasks.</span></div>
<div><strong>Small</strong><span>Very fast and cheap. Good for quick questions, short rewrites and apps that need speed.</span></div>
</div>
<p>Names hint at size. Anthropic's Claude family runs from Haiku (small) through Sonnet to Opus (large). Words like "mini", "flash" or "lite" usually mean a smaller, faster model.</p>
<h3>"Thinking" or reasoning models</h3>
<p>Some models, or a "thinking" setting, spend extra time working through a problem step by step before answering. They're slower but noticeably better at math, planning, tricky logic and coding. Use them when getting it right matters more than speed.</p>
<h3>Other things that differ</h3>
<ul>
<li><strong>Memory for long documents</strong> (the <strong>context window</strong>): how much text it can read at once. Bigger is better for long reports or books.</li>
<li><strong>Seeing and hearing</strong>: most current models can read images, PDFs and screenshots; many can talk out loud.</li>
<li><strong>Web search</strong>: whether it can look up current information.</li>
<li><strong>Open models</strong>: some, such as Meta's Llama, can be downloaded and run on your own computer, which keeps your data private.</li>
</ul>
<h3>Which should I use?</h3>
<div class="table-wrap"><table class="pick-table">
<thead><tr><th>If you want to…</th><th>Try</th></tr></thead>
<tbody>
<tr><td>Ask everyday questions, draft an email</td><td>The default model in any major chatbot</td></tr>
<tr><td>Solve a hard problem or check your reasoning</td><td>A reasoning or "thinking" mode</td></tr>
<tr><td>Get current facts with sources</td><td>A chatbot with web search, or Perplexity</td></tr>
<tr><td>Summarize a long PDF or report</td><td>A large model with a long context window</td></tr>
<tr><td>Keep sensitive data on your own computer</td><td>An open model run locally</td></tr>
</tbody></table></div>
<div class="callout"><strong>Good news</strong>The top models from the big companies are close in quality. Pick one, learn it well, and try another when a task isn't going well. The Models timeline on this site shows what's new.</div>`,
        tryIt: { tool: "Any two of ChatGPT, Claude and Gemini", prompt: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? Explain your reasoning. (Ask two different models, or one with \"thinking\" on and off, and compare.)" },
        quiz: { q: "When is a reasoning (\"thinking\") model the best choice?", opts: ["For the fastest possible reply to a simple question", "For hard problems like math, planning or tricky logic", "Only for generating images", "When you have no internet connection"], correct: 1, feedback: "Reasoning models take extra time to work through a problem step by step. That makes them slower but better at hard, multi-step tasks." }
      }
    ]
  }
];
