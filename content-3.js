window.MODULES.push({
  id: 7, icon: "code", color: "violet", level: "Technical",
  title: "Under the hood",
  desc: "For technical learners: tokens, how models are trained, building with AI through APIs and retrieval, and how agents and evaluations work.",
  recap: [
    "Models read and write tokens, see only what fits in the context window, and pick each token from probabilities.",
    "Pretraining builds knowledge; fine-tuning and feedback make the model a helpful assistant; reinforcement learning teaches reasoning.",
    "Most AI products combine a prompt, retrieved data and tools, so build a test set and measure every change."
  ],
  lessons: [
    {
      title: "Tokens, context and probabilities", time: 7,
      intro: "The three mechanics that explain most of a language model's behavior, including its odd mistakes.",
      content: `
<h3>Tokens, not words</h3>
<p>Models don't read letters or whole words. Text is split into <strong>tokens</strong>: common words are one token, rarer words are split into pieces. In English, 1,000 tokens is roughly 750 words.</p>
<pre class="code"><code>"unbelievably helpful"  →  ["un", "believ", "ably", " helpful"]   (illustrative)</code></pre>
<p>This explains a classic failure: asked how many r's are in "strawberry", a model can miscount, because it sees a couple of tokens, not ten letters. Newer models handle this better, often by reasoning step by step.</p>
<h3>The context window</h3>
<p>Everything the model can consider at once — the instructions, the whole conversation, any documents, and the reply it's writing — must fit in its <strong>context window</strong>, measured in tokens. Current models range from about a hundred thousand to over a million tokens. When a conversation outgrows it, apps drop or summarize older parts, which is why long chats can "forget" early details.</p>
<h3>Probabilities and temperature</h3>
<p>For each step the model produces a probability for every possible next token, then one is chosen. <strong>Temperature</strong> controls how adventurous that choice is: near 0, it almost always takes the top option, giving consistent output; higher values give more variety. That's why the same prompt can produce different answers.</p>
<div class="callout"><strong>Why it matters for cost</strong>AI services that developers use (APIs) charge per million tokens, with separate prices for input and output. Output tokens usually cost several times more, so long answers cost more than long questions.</div>`,
      tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "How many times does the letter r appear in \"strawberry\"? Then explain why language models have historically found questions like this hard, in terms of tokens." },
      quiz: { q: "Why can a language model miscount the letters in a word?", opts: ["It reads text as tokens, chunks of text, rather than individual letters", "It was never shown any English words", "Its context window is too small for one word", "Counting is blocked by safety rules"], correct: 0, feedback: "Models see tokens. A word like \"strawberry\" may be just two or three tokens, so its individual letters aren't directly visible." }
    },
    {
      title: "How models are trained", time: 7,
      intro: "From raw text to a helpful assistant: the stages every modern chatbot goes through.",
      content: `
<h3>1. Pretraining</h3>
<p>The model learns to predict the next token across trillions of tokens of text and code. This takes thousands of specialized chips running for months, and produces a <strong>base model</strong>: knowledgeable, but it just continues text rather than following instructions.</p>
<h3>2. Fine-tuning on examples</h3>
<p>The base model is then trained on many example conversations showing helpful answers. This teaches it to act as an assistant: follow instructions, answer questions, use a consistent format.</p>
<h3>3. Learning from feedback</h3>
<p>People compare pairs of answers and pick the better one; the model is trained to prefer what people preferred. This is <strong>reinforcement learning from human feedback</strong> (RLHF). Anthropic also uses a written set of principles, a "constitution", with AI-generated feedback to shape behavior.</p>
<h3>4. Training to reason</h3>
<p>Reasoning models get further reinforcement learning on problems with checkable answers, such as math and code. Rewarding correct final answers teaches them to work through problems step by step.</p>
<div class="callout"><strong>Knowledge cutoff</strong>A model only knows what was in its training data, which ends on a <strong>cutoff date</strong>. Anything newer has to come from web search or documents you provide.</div>
<h3>Open and closed models</h3>
<p>Some companies publish their trained weights so anyone can run and adapt the model (open-weight models such as Llama, Mistral, DeepSeek and Qwen). Others offer access only through their apps and APIs.</p>`,
      tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "What is your knowledge cutoff date? How do you handle a question about something that happened after it, and how can I tell whether your answer used a web search?" },
      quiz: { q: "What does pretraining mainly teach a model?", opts: ["To predict the next token across a huge amount of text", "To follow a company's safety rules", "To search the web for answers", "To rank two answers by quality"], correct: 0, feedback: "Pretraining is next-token prediction at massive scale. Following instructions and preferences come from later fine-tuning and feedback stages." }
    },
    {
      title: "Building with AI: APIs, prompts and retrieval", time: 8,
      intro: "How apps use AI models behind the scenes, and the main patterns developers rely on.",
      content: `
<h3>An API call</h3>
<p>Apps talk to models through an <strong>API</strong>: your code sends instructions and messages, and gets a reply back. A typical request looks like this (details vary by provider):</p>
<pre class="code"><code>{
  "model": "a-model-name",
  "system": "You are a friendly tutor for beginners. Answer in under 100 words.",
  "messages": [
    { "role": "user", "content": "What is a context window?" }
  ],
  "max_tokens": 300
}</code></pre>
<p>The <strong>system prompt</strong> sets the model's role, tone and rules for the whole conversation. Giving one or two worked examples in the prompt ("few-shot" prompting) and asking for a fixed format such as JSON make results far more reliable.</p>
<h3>Retrieval-augmented generation (RAG)</h3>
<p>To answer from your own documents, which the model never saw in training:</p>
<ol class="steps">
<li>Split documents into short chunks and turn each into an <strong>embedding</strong>, a list of numbers that captures its meaning.</li>
<li>When a question arrives, embed it too and find the chunks with the closest meaning.</li>
<li>Put those chunks into the prompt and ask the model to answer only from them, citing which it used.</li>
</ol>
<h3>Prompting, RAG or fine-tuning?</h3>
<p>Start with a good prompt. Add retrieval when answers depend on your own or frequently changing information. Consider fine-tuning only when you need a consistent style or format at large scale and prompting can't get there.</p>
<div class="callout"><strong>Two security basics</strong>Keep API keys on a server, never in a web page or app that users can inspect. And treat documents and web pages as untrusted: text inside them can try to give the model instructions (<strong>prompt injection</strong>).</div>`,
      tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Write a system prompt for a customer-support assistant for a small bakery. Include its tone, what it must never do, which questions it should answer only from a provided menu and policy document, and when to hand off to a human." },
      quiz: { q: "What does retrieval-augmented generation (RAG) do?", opts: ["Finds relevant documents and adds them to the prompt so the answer is based on them", "Retrains the model every night on new documents", "Makes the model answer faster by skipping steps", "Stores every conversation permanently"], correct: 0, feedback: "RAG looks up the most relevant pieces of your documents and puts them in front of the model, so answers come from your data without retraining." }
    },
    {
      title: "Agents, tools and evaluation", time: 8,
      intro: "How AI agents use tools in a loop, and how teams check that an AI system actually works.",
      content: `
<h3>Tool use</h3>
<p>You describe tools to the model (a name, what it does, and what inputs it takes), such as <em>search_flights</em> or <em>create_calendar_event</em>. When useful, the model replies with a request to use one. <strong>Your code runs the tool</strong> and sends the result back, and the model continues.</p>
<h3>The agent loop</h3>
<ol class="flow">
<li>Goal</li><li>Plan the next step</li><li>Call a tool</li><li>Read the result</li><li>Repeat or finish</li>
</ol>
<p>An agent is this loop running until the goal is met. <strong>MCP</strong> (Model Context Protocol), an open standard Anthropic introduced in 2024 and now widely supported, lets AI apps connect to tools and data sources in one consistent way instead of a custom integration for each.</p>
<h3>Guardrails</h3>
<ul>
<li>Give each agent only the access it needs.</li>
<li>Require human approval for actions that spend money, send messages or delete things.</li>
<li>Log every tool call, and cap time and spending.</li>
</ul>
<h3>Evaluation</h3>
<p>Before shipping, build an <strong>evaluation set</strong>: real examples with what a good answer looks like. Grade outputs automatically where you can (exact checks, or a model acting as grader against a rubric) and by people for a sample. Rerun it whenever you change the prompt, model or tools; small changes often have surprising effects.</p>
<div class="callout"><strong>Choosing a model in practice</strong>Pick the smallest, cheapest model that passes your evaluation set. Move up a size only for the tasks that need it.</div>`,
      tryIt: { tool: "ChatGPT, Claude or Gemini", prompt: "Design a simple AI agent that sorts my email into urgent, later and newsletters. List the tools it needs, which actions should need my approval, and five test emails I could use to check it works." },
      quiz: { q: "When a model uses a tool, who actually runs the tool?", opts: ["Your application's code runs it and sends the result back to the model", "The model runs it inside its own parameters", "The person using the app runs it by hand every time", "The AI company runs every tool on its servers"], correct: 0, feedback: "The model only asks for a tool call. Your code decides whether to run it, runs it, and returns the result, which is also where guardrails live." }
    }
  ]
});

window.GLOSSARY.push(
  { term: "API", def: "A way for software to talk to other software. Apps send requests to an AI model's API and get replies back." },
  { term: "System prompt", def: "Instructions given to a model before the conversation starts, setting its role, tone and rules." },
  { term: "Embedding", def: "A list of numbers representing the meaning of a piece of text, so texts with similar meaning can be found quickly." },
  { term: "RLHF (reinforcement learning from human feedback)", def: "Training a model to prefer the kinds of answers people rated as better." },
  { term: "Tool use (function calling)", def: "A model asking an app to run a tool, such as a search or a calculation, and using the result in its answer." },
  { term: "MCP (Model Context Protocol)", def: "An open standard for connecting AI apps to tools and data sources in one consistent way." },
  { term: "Evaluation (evals)", def: "A set of test examples used to measure how well an AI system performs, rerun after every change." },
  { term: "Prompt injection", def: "Hidden or malicious instructions inside a document, email or web page that try to make an AI do something it shouldn't." },
  { term: "Knowledge cutoff", def: "The date a model's training data ends. It knows nothing after that unless it searches or is given documents." }
);
