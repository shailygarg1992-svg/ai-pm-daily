// ─── Hot AI Tools (shared across days, shown contextually) ─────
export const HOT_TOOLS = [
  {
    name: "Claude Code",
    category: "AI Coding",
    description: "Anthropic's CLI-based AI coding agent that lives in your terminal. It can read your codebase, write code, run commands, and iterate on complex tasks autonomously.",
    whyItMatters: "PMs can use it to prototype features, generate PRDs, and understand codebases without needing deep engineering skills.",
    tryIt: "Install Claude Code, open a project folder, and ask it to 'explain the architecture of this project' or 'add a dark mode toggle to the settings page'.",
    url: "https://docs.anthropic.com/en/docs/claude-code"
  },
  {
    name: "Cursor",
    category: "AI IDE",
    description: "An AI-first code editor built on VS Code that integrates LLMs directly into the development workflow. It can autocomplete, refactor, and write entire features from natural language.",
    whyItMatters: "Understanding how AI-native dev tools work helps PMs scope engineering work more accurately and communicate with developers.",
    tryIt: "Download Cursor, open any project, press Cmd+K, and describe a change you want to make in plain English. Watch it generate the code.",
    url: "https://cursor.sh"
  },
  {
    name: "v0 by Vercel",
    category: "AI UI Generation",
    description: "An AI tool that generates production-ready React/Next.js UI components from text descriptions or screenshots. It outputs clean, deployable code using shadcn/ui and Tailwind.",
    whyItMatters: "PMs can go from wireframe to working prototype in minutes instead of days, dramatically speeding up the design-to-code feedback loop.",
    tryIt: "Go to v0.dev, describe a UI component like 'a pricing page with 3 tiers and a toggle for monthly/annual billing', and deploy the result.",
    url: "https://v0.dev"
  },
  {
    name: "OpenHands (formerly OpenDevin)",
    category: "Open-Source AI Agent",
    description: "An open-source AI software engineer that can browse the web, write code, and execute commands. It aims to replicate what a junior developer can do.",
    whyItMatters: "Shows where autonomous AI agents are headed — PMs need to understand the capabilities and limits of agent-based development tools.",
    tryIt: "Run OpenHands locally with Docker, give it a GitHub issue URL, and watch it attempt to solve the bug autonomously.",
    url: "https://github.com/All-Hands-AI/OpenHands"
  },
  {
    name: "Bolt.new",
    category: "AI Full-Stack Builder",
    description: "A browser-based AI tool that generates, runs, and deploys full-stack web apps from a single prompt. No local setup needed — it runs everything in-browser.",
    whyItMatters: "Enables non-technical PMs to build working prototypes and MVPs without any developer involvement.",
    tryIt: "Go to bolt.new, describe an app like 'a habit tracker with daily streaks and charts', and watch it build and deploy it live.",
    url: "https://bolt.new"
  },
  {
    name: "Perplexity",
    category: "AI Search",
    description: "An AI-powered search engine that provides direct answers with cited sources instead of a list of links. It combines web search with LLM reasoning.",
    whyItMatters: "PMs should understand how AI search disrupts traditional SEO and content strategies — your product's discoverability rules are changing.",
    tryIt: "Use Perplexity to research a competitive analysis topic like 'AI features in project management tools 2025' and compare the output to a Google search.",
    url: "https://perplexity.ai"
  },
  {
    name: "Replit Agent",
    category: "AI App Builder",
    description: "Replit's AI agent that builds full applications from natural language descriptions, handling everything from database setup to deployment.",
    whyItMatters: "Demonstrates the end-state of AI-assisted development — where PMs describe the product and AI builds it.",
    tryIt: "Open Replit, start an Agent session, and ask it to build 'a simple feedback collection form with a dashboard to view responses'.",
    url: "https://replit.com"
  },
  {
    name: "NotebookLM",
    category: "AI Research",
    description: "Google's AI research assistant that lets you upload documents and have AI-powered conversations about them. It generates audio overviews and keeps responses grounded in your sources.",
    whyItMatters: "Perfect for PMs doing competitive research, analyzing user feedback docs, or preparing for stakeholder meetings — AI-grounded analysis, not hallucinations.",
    tryIt: "Upload a competitor's whitepaper or your own PRD to NotebookLM and ask it to 'identify the 3 biggest risks in this document'.",
    url: "https://notebooklm.google.com"
  },
  {
    name: "Windsurf (Codeium)",
    category: "AI IDE",
    description: "An AI-powered IDE with 'Cascade' — a deep context-aware coding agent that understands your entire codebase and can make multi-file changes.",
    whyItMatters: "Represents the next wave of AI dev tools where the AI understands project-wide context, not just single files.",
    tryIt: "Install Windsurf, open a project, and use Cascade to ask 'refactor the authentication flow to use JWT tokens instead of sessions'.",
    url: "https://codeium.com/windsurf"
  },
  {
    name: "Lovable (formerly GPT Engineer)",
    category: "AI App Builder",
    description: "An AI tool that turns product specs into full-stack applications with a visual builder interface. It generates React apps with Supabase backends.",
    whyItMatters: "PMs can build and iterate on product ideas at the speed of thought — describe what you want, and get a working app.",
    tryIt: "Go to lovable.dev and describe an app like 'a simple CRM for tracking sales leads with a Kanban board'. Deploy it and share the link.",
    url: "https://lovable.dev"
  }
];

// Map tools to days (which tools to show on which day)
export const DAY_TOOLS = {
  1: [0, 3, 6],    // Claude Code, OpenHands, Replit Agent (agents day)
  2: [5, 7],        // Perplexity, NotebookLM (LLMs day)
  3: [5, 7],        // Perplexity, NotebookLM (RAG day)
  4: [5, 2],        // Perplexity, v0 (metrics day)
  5: [0, 3],        // Claude Code, OpenHands (safety day)
  6: [7, 2, 4],     // NotebookLM, v0, Bolt.new (multimodal day)
  7: [0, 1, 2, 3, 4, 8, 9], // All builder tools (playbook day)
};

// YouTube video search queries per day topic for "Learn More" feature
export const DAY_VIDEOS = {
  1: "AI agents explained for product managers 2025",
  2: "how large language models work explained simply",
  3: "RAG vs fine tuning vs prompt engineering explained",
  4: "AI product metrics KPIs for product managers",
  5: "AI safety and responsible AI for product teams",
  6: "multimodal AI vision speech explained",
  7: "AI native product management playbook",
};

export const DAYS = [
  {
    day: 1,
    theme: "AI Agents — Your New Digital Coworkers",
    emoji: "\uD83E\uDD16",
    color: "#6366F1",
    briefing: [
      {
        text: "AI agents don't just answer questions — they autonomously complete multi-step tasks. Unlike a chatbot that waits for each prompt, an agent decides what to do next on its own.",
        advancedText: "AI agents implement the ReAct (Reasoning + Acting) loop: observe state, reason about next steps, execute an action via tool use, then re-observe. This differs from simple prompt-response LLM calls by maintaining persistent state and goal-directed behavior across multiple turns.",
        example: "Think of it like a self-checkout machine vs. a personal shopper. The chatbot is the self-checkout (you scan each item). The agent is the personal shopper — you say 'I need a dinner party outfit' and they handle everything.",
        advancedExample: "Claude Code is a real AI agent: you say 'add authentication to my app' and it reads your codebase, plans the approach, writes code across multiple files, runs tests, and iterates on failures — all without you intervening between steps."
      },
      {
        text: "Agents work by chaining actions: search for information, make a decision, use a tool, check the result, and loop until the task is done. This is called multi-step reasoning.",
        advancedText: "The tool-calling protocol (function calling) is what enables agents. The LLM outputs structured JSON specifying which tool to call and with what parameters. The runtime executes the tool, returns results, and the LLM decides the next step. This is formalized in the Model Context Protocol (MCP).",
        example: "Imagine ordering at a drive-through vs. having a personal assistant plan your entire meal prep for the week — grocery list, store selection, budget optimization, all without you intervening.",
        advancedExample: "When you ask Replit Agent to 'build a todo app with auth', it chains: scaffold project → set up database schema → implement API routes → add auth middleware → build UI components → run tests → deploy. Each step's output informs the next."
      },
      {
        text: "Multi-agent systems use specialized agents that collaborate. One agent researches, another writes, a third reviews — just like a team of humans, but faster.",
        advancedText: "Multi-agent architectures include supervisor patterns (one agent delegates), peer-to-peer (agents negotiate), and pipeline patterns (sequential handoffs). OpenHands uses a planner agent + executor agent + reviewer agent pattern.",
        example: "Think of it like a Walmart distribution center: one system tracks inventory, another optimizes truck routes, a third manages warehouse stocking. Each is specialized, but they coordinate to get products on shelves.",
        advancedExample: "In a code review pipeline: Agent 1 (Coder) writes the implementation, Agent 2 (Reviewer) checks for bugs and style, Agent 3 (Security) scans for vulnerabilities. Each has different system prompts and tool access."
      },
      {
        text: "For PMs, the design challenge shifts from screens and buttons to agent behaviors and permission models. You're designing what the AI is allowed to do, not what the user clicks.",
        advancedText: "Agent permission models define: which tools the agent can access, what data it can read/write, whether it needs human approval for destructive actions, and token/cost budgets. This is analogous to RBAC but for AI actions.",
        example: "Imagine designing a self-driving car's behavior rules instead of its dashboard. The PM decides: Can the car change lanes without asking? Can it take a detour? These 'permission models' define the product.",
        advancedExample: "Claude Code asks for permission before running shell commands or editing files. The PM decision: which actions are auto-approved vs. require confirmation? Too many prompts = friction. Too few = risk. That's your product design surface."
      },
      {
        text: "Trust is the #1 user-facing challenge with agents. Users need to understand what the agent did, why, and have the ability to override it. Transparency isn't optional — it's the product.",
        advancedText: "Trust calibration requires: action audit trails, step-by-step reasoning visibility, undo/rollback capabilities, and confidence indicators. The 'inner monologue' or chain-of-thought display is a key UX pattern for agent transparency.",
        example: "Think of it like a financial advisor. You wouldn't trust one who just says 'I moved your money.' You want to know where, why, and the ability to say 'undo that.' Same principle for AI agents.",
        advancedExample: "Cursor shows a diff preview before applying changes. Claude Code shows each command it wants to run before executing. This 'preview → approve → execute' pattern is becoming the standard trust interface for AI agents."
      }
    ],
    quiz: [
      {
        question: "What's the key difference between a chatbot and an AI agent?",
        options: [
          "Agents are faster than chatbots",
          "Chatbots use more advanced AI models",
          "Agents autonomously complete multi-step tasks without waiting for each prompt",
          "Agents can only work with text, chatbots handle images too"
        ],
        answer: 2,
        learnLinks: [
          { title: "AI Agents Explained in 5 Minutes", url: "https://www.youtube.com/results?search_query=AI+agents+explained+simply&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "In a multi-agent system, what happens?",
        options: [
          "Multiple specialized agents collaborate on different parts of a task",
          "One powerful agent handles everything alone",
          "Agents compete against each other for the best answer",
          "Users manually assign tasks to each agent"
        ],
        answer: 0,
        learnLinks: [
          { title: "Multi-Agent AI Systems Explained", url: "https://www.youtube.com/results?search_query=multi+agent+AI+systems+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "As a PM for AI agents, your primary design challenge shifts to:",
        options: [
          "Making more colorful user interfaces",
          "Writing the AI's code yourself",
          "Reducing the number of features",
          "Designing agent behaviors and permission models"
        ],
        answer: 3,
        learnLinks: [
          { title: "Product Management for AI Products", url: "https://www.youtube.com/results?search_query=product+management+AI+agents&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Why is trust the #1 challenge with AI agents?",
        options: [
          "Because agents don't need user trust to function",
          "Because users need transparency into what the agent did and why",
          "Because trust makes the agent run faster",
          "Because AI agents are always wrong"
        ],
        answer: 1,
        learnLinks: [
          { title: "Building Trust in AI Systems", url: "https://www.youtube.com/results?search_query=trust+in+AI+agents+product+design&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What does Claude Code do when it wants to run a shell command?",
        options: [
          "It runs it silently without telling you",
          "It sends an email to the team lead for approval",
          "It shows you the command and asks for permission before executing",
          "It only runs pre-approved commands from a whitelist"
        ],
        answer: 2,
        toolQuestion: true,
        learnLinks: [
          { title: "Claude Code Overview", url: "https://www.youtube.com/results?search_query=claude+code+AI+coding+agent+demo&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  },
  {
    day: 2,
    theme: "How LLMs Actually Work (No PhD Required)",
    emoji: "\uD83E\uDDE0",
    color: "#8B5CF6",
    briefing: [
      {
        text: "Large Language Models (LLMs) are essentially sophisticated autocomplete. They predict the most likely next word based on patterns learned from billions of text examples.",
        advancedText: "LLMs are transformer-based neural networks trained via self-supervised learning on massive text corpora. They learn probability distributions over token sequences. The 'intelligence' emerges from scale — billions of parameters encoding compressed world knowledge.",
        example: "Think of it like your phone's keyboard predictions, but scaled up massively. Your phone suggests 'you' after 'thank' — an LLM does this for entire paragraphs, essays, and code.",
        advancedExample: "GPT-4 has ~1.8 trillion parameters across a mixture-of-experts architecture. Each 'parameter' is a learned weight that encodes relationships between concepts. The model doesn't 'know' facts — it's learned statistical patterns that happen to encode factual relationships."
      },
      {
        text: "The 'attention mechanism' is what makes LLMs powerful. It lets the model focus on the most relevant parts of your input, even if they're far apart in the text.",
        advancedText: "Self-attention computes Query-Key-Value matrices for each token position, allowing every token to attend to every other token. Multi-head attention runs this in parallel across different 'heads', each learning different relationship types (syntactic, semantic, positional).",
        example: "Imagine reading a mystery novel. When the detective says 'the butler did it' on page 300, your brain instantly connects it to the suspicious butler scene on page 12. That's attention — connecting distant but relevant information.",
        advancedExample: "When processing 'The cat sat on the mat because it was tired', attention lets the model correctly resolve 'it' to 'cat' (not 'mat') by computing high attention weights between 'it' and 'cat' based on semantic compatibility."
      },
      {
        text: "Hallucinations happen when LLMs generate confident-sounding but factually wrong information. The model is optimized for plausibility, not truth.",
        advancedText: "Hallucinations occur because LLMs are trained on a next-token prediction objective, not a truth-verification objective. The training signal rewards fluent, contextually appropriate text — not factual accuracy. This is a fundamental architectural limitation, not a bug to be patched.",
        example: "Think of it like a confident friend who always has an answer at trivia night — even when they're guessing. They sound sure saying 'The capital of Australia is Sydney!' but they're wrong (it's Canberra).",
        advancedExample: "Ask an LLM to cite a specific research paper — it will often generate a plausible-sounding title, author list, and journal name that doesn't exist. The model learned the pattern of 'what citations look like' without access to a citation database."
      },
      {
        text: "LLMs have a 'context window' — a limit on how much text they can consider at once. Exceeding it means the model literally forgets earlier parts of the conversation.",
        advancedText: "Context windows are measured in tokens (roughly 4 characters each). Claude has 200K tokens, GPT-4 has 128K. The computational cost scales quadratically with context length (O(n\u00B2) attention). Long-context models use techniques like sliding window attention or sparse attention to manage this.",
        example: "Imagine a whiteboard in a meeting room. You can only fit so much on it. Once it's full, you have to erase old notes to write new ones. The model works the same way — older context gets pushed out.",
        advancedExample: "Perplexity's AI search uses RAG to work around context limits: instead of stuffing all of Wikipedia into the context window, it retrieves only the relevant paragraphs for your query, keeping the context focused and accurate."
      },
      {
        text: "As a PM, understanding LLM limits helps you make better product decisions: when to use AI vs. traditional code, how to set user expectations, and where guardrails are needed.",
        advancedText: "Key PM decisions informed by LLM understanding: temperature settings (creativity vs. consistency), max token limits (cost control), model selection (capability vs. latency vs. cost tradeoffs), and fallback strategies when AI confidence is low.",
        example: "Think of it like knowing your car's fuel range. You wouldn't plan a 500-mile road trip in a car that only goes 300 miles. Knowing the LLM's limits helps you design features that actually work reliably.",
        advancedExample: "NotebookLM grounds all responses in your uploaded documents — it won't hallucinate because it's constrained to your source material. This is a product design choice that trades creativity for accuracy. That's the PM tradeoff."
      }
    ],
    quiz: [
      {
        question: "At its core, how does an LLM generate text?",
        options: [
          "It searches the internet in real-time for answers",
          "It predicts the most likely next word based on learned patterns",
          "It copies text directly from its training data",
          "It uses a rule-based decision tree"
        ],
        answer: 1,
        learnLinks: [
          { title: "How Large Language Models Work", url: "https://www.youtube.com/results?search_query=how+do+large+language+models+work+simply&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What does the 'attention mechanism' allow an LLM to do?",
        options: [
          "Pay attention to the user's emotions",
          "Increase its processing speed",
          "Focus on the most relevant parts of input, even if far apart",
          "Attend to multiple conversations simultaneously"
        ],
        answer: 2,
        learnLinks: [
          { title: "Attention Mechanism Explained", url: "https://www.youtube.com/results?search_query=attention+mechanism+transformers+explained+simply&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Why do LLMs hallucinate?",
        options: [
          "Because they run out of memory",
          "Because the user asked a confusing question",
          "Because they're deliberately lying",
          "Because they're optimized for plausible-sounding text, not factual accuracy"
        ],
        answer: 3,
        learnLinks: [
          { title: "Why AI Hallucinations Happen", url: "https://www.youtube.com/results?search_query=why+do+AI+LLMs+hallucinate+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What is a 'context window' in an LLM?",
        options: [
          "The limit on how much text the model can consider at once",
          "The physical window on your screen showing the AI chat",
          "The time window during which the model is available",
          "A setting that controls the AI's personality"
        ],
        answer: 0,
        learnLinks: [
          { title: "LLM Context Windows Explained", url: "https://www.youtube.com/results?search_query=LLM+context+window+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "How does Perplexity avoid hallucinations compared to ChatGPT?",
        options: [
          "It uses a bigger model with more parameters",
          "It searches the live web and cites specific sources for each claim",
          "It runs the answer through a human reviewer",
          "It only answers questions it's 100% sure about"
        ],
        answer: 1,
        toolQuestion: true,
        learnLinks: [
          { title: "How Perplexity AI Works", url: "https://www.youtube.com/results?search_query=perplexity+AI+how+it+works+search&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  },
  {
    day: 3,
    theme: "RAG, Fine-Tuning & Prompting — The PM Toolkit",
    emoji: "\uD83D\uDEE0\uFE0F",
    color: "#EC4899",
    briefing: [
      {
        text: "Prompting is the simplest way to guide an LLM — you write instructions in plain language. It's fast, cheap, and requires zero engineering. Start here for every AI feature.",
        advancedText: "Prompting techniques include: zero-shot (just ask), few-shot (provide examples), chain-of-thought (ask the model to reason step by step), and system prompts (set persistent behavior). Prompt engineering is the highest-ROI skill for AI PMs.",
        example: "Think of it like giving directions to a taxi driver. You don't modify the car or install GPS — you just say 'Take me to the airport via the highway.' Clear instructions, immediate results.",
        advancedExample: "In v0 by Vercel, you describe a UI in natural language and it generates React components. The entire product IS prompt engineering — your input quality directly determines output quality. No training, no databases, just great prompts."
      },
      {
        text: "RAG (Retrieval-Augmented Generation) lets the LLM search your company's data before answering. It reduces hallucinations because the model answers from real documents, not just memory.",
        advancedText: "RAG pipeline: (1) embed your documents into vectors, (2) store in a vector database, (3) on query, embed the question, (4) find similar document chunks via cosine similarity, (5) inject retrieved chunks into the LLM prompt as context. This is the backbone of enterprise AI.",
        example: "Imagine a customer service rep who can instantly pull up your account history before answering your question, instead of guessing from general training. That's RAG — real data, better answers.",
        advancedExample: "NotebookLM is pure RAG: you upload documents, it chunks and embeds them, then every answer is grounded in your specific sources. It even shows which paragraphs it used. This is the gold standard for RAG UX."
      },
      {
        text: "Fine-tuning permanently changes the model's behavior by training it on your specific data. It's expensive and slow, but creates a model that 'thinks' like your domain expert.",
        advancedText: "Fine-tuning options: full fine-tune (expensive, changes all weights), LoRA (low-rank adaptation, cheaper), RLHF (reward model from human preferences), and DPO (direct preference optimization). Most startups should NOT fine-tune — RAG + good prompts covers 90% of use cases.",
        example: "Think of it like the difference between hiring a general contractor vs. training an apprentice for years. The apprentice eventually knows your specific house inside out, but the training investment is significant.",
        advancedExample: "Cursor fine-tuned models specifically for code editing tasks — predicting diffs, understanding file contexts, and generating inline completions. This domain-specific fine-tuning is what makes it feel 'smarter' than general-purpose ChatGPT for coding."
      },
      {
        text: "The PM framework: start with prompting, add RAG when you need accuracy from private data, and only fine-tune when the model needs to deeply learn your domain's patterns.",
        advancedText: "Decision matrix: Prompting (hours to implement, $0 upfront, good for 60% of use cases) → RAG ($1K-$10K setup, good for 30% of use cases requiring private data) → Fine-tuning ($10K-$100K+, last resort for unique domain patterns). Always benchmark before escalating.",
        example: "It's like cooking: first try the recipe as-is (prompting). Then add your secret ingredients (RAG with your data). Only build a custom kitchen (fine-tuning) if you're opening a restaurant.",
        advancedExample: "A real example: Walmart's AI product team started with GPT prompting for product descriptions, added RAG to pull from their product catalog, and only considered fine-tuning for their specific brand voice after the first two steps proved insufficient."
      },
      {
        text: "As a PM, knowing which approach to recommend saves engineering weeks. Most features that teams want to fine-tune for can actually be solved with good prompting + RAG.",
        advancedText: "Red flags for premature fine-tuning: the team hasn't tried few-shot prompting, they don't have a RAG pipeline, they have less than 10K training examples, or they can't articulate what behavior the fine-tune would change that prompts can't.",
        example: "Think of it like a Walmart store manager deciding between rearranging shelf displays (prompting), installing a new inventory system (RAG), or rebuilding the entire store (fine-tuning). Usually, rearranging shelves works.",
        advancedExample: "When a team says 'we need to fine-tune', ask: 'Show me 5 examples where the prompted model fails and explain why retrieval wouldn't fix it.' If they can't, they don't need fine-tuning — they need better prompts."
      }
    ],
    quiz: [
      {
        question: "Which approach should a PM try FIRST for any AI feature?",
        options: [
          "Fine-tuning the model on company data",
          "Building a custom model from scratch",
          "RAG with a vector database",
          "Prompting — writing clear instructions in plain language"
        ],
        answer: 3,
        learnLinks: [
          { title: "Prompting vs RAG vs Fine-Tuning", url: "https://www.youtube.com/results?search_query=prompting+vs+RAG+vs+fine+tuning+when+to+use&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What does RAG do that basic prompting cannot?",
        options: [
          "Makes the model run faster",
          "Permanently changes the model's behavior",
          "Lets the model search real documents before answering",
          "Removes the need for any prompt engineering"
        ],
        answer: 2,
        learnLinks: [
          { title: "RAG Explained in 5 Minutes", url: "https://www.youtube.com/results?search_query=RAG+retrieval+augmented+generation+explained+simply&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Why does RAG reduce hallucinations?",
        options: [
          "It forces the model to answer from real documents instead of guessing",
          "It makes the model smarter overall",
          "It slows down the model so it thinks more carefully",
          "It removes the model's ability to generate creative text"
        ],
        answer: 0,
        learnLinks: [
          { title: "How RAG Reduces Hallucinations", url: "https://www.youtube.com/results?search_query=RAG+reduce+hallucinations+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "When should a PM recommend fine-tuning?",
        options: [
          "As the first step for every AI project",
          "Fine-tuning is always better than RAG",
          "Whenever the team has extra budget",
          "Only when the model needs to deeply learn domain-specific patterns that prompting and RAG can't handle"
        ],
        answer: 3,
        learnLinks: [
          { title: "When to Fine-Tune an LLM", url: "https://www.youtube.com/results?search_query=when+to+fine+tune+LLM+vs+RAG&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "How does v0 by Vercel generate UI components?",
        options: [
          "It uses fine-tuned models trained on millions of UI screenshots",
          "You describe the UI in natural language and it generates production React code via prompting",
          "It requires you to draw wireframes in a visual editor first",
          "It copies components from a library of pre-built templates"
        ],
        answer: 1,
        toolQuestion: true,
        learnLinks: [
          { title: "v0 by Vercel Demo", url: "https://www.youtube.com/results?search_query=v0+vercel+AI+UI+generation+demo&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  },
  {
    day: 4,
    theme: "AI Product Metrics — What to Measure",
    emoji: "\uD83D\uDCCA",
    color: "#F59E0B",
    briefing: [
      {
        text: "Traditional product metrics (DAU, retention, NPS) still matter for AI products, but they're insufficient. You need AI-specific metrics to understand if the AI itself is working.",
        advancedText: "The AI metrics stack: Layer 1 — model performance (latency, tokens/sec, cost per query). Layer 2 — output quality (accuracy, hallucination rate, relevance). Layer 3 — user experience (task completion, override rate, satisfaction). Layer 4 — business impact (ROI, automation rate, support ticket deflection).",
        example: "Think of it like measuring a restaurant. Customer satisfaction (NPS) tells you if people like dining there, but you also need kitchen metrics — food waste rate, cook time, order accuracy. AI metrics are the 'kitchen metrics.'",
        advancedExample: "Cursor tracks: completions accepted vs. rejected, time saved per suggestion, multi-line vs. single-line acceptance rates, and tab-to-accept latency. These AI-specific metrics directly inform their model improvements."
      },
      {
        text: "Task Completion Rate measures how often the AI successfully finishes what the user asked. It's the most fundamental AI metric — if the AI can't complete tasks, nothing else matters.",
        advancedText: "Task completion has nuances: partial completion (AI did 80% of the work), assisted completion (AI helped but human finished), and autonomous completion (AI did it all). Track these separately — they indicate different product maturity stages.",
        example: "Imagine a Walmart self-checkout that fails to scan items 40% of the time. No amount of nice UI design fixes that. Task completion rate is your 'does it actually work?' metric.",
        advancedExample: "Bolt.new tracks how many apps it generates that actually deploy successfully without errors. If 70% of generated apps have build errors, that's a 70% task failure rate regardless of how good the UI looks."
      },
      {
        text: "Hallucination Rate tracks how often the AI generates incorrect information. For high-stakes products (medical, financial, legal), even a 2% hallucination rate can be disqualifying.",
        advancedText: "Measuring hallucination requires ground truth — you need a reference answer to compare against. Methods: human evaluation (expensive, gold standard), automated fact-checking (faster, less reliable), and retrieval comparison (check if the answer matches source documents). Set different thresholds per risk level.",
        example: "Think of it like a GPS that gives wrong directions 5% of the time. For a road trip, maybe annoying. For an ambulance finding a hospital? Potentially fatal. Context determines acceptable hallucination rates.",
        advancedExample: "Perplexity displays inline citations for every factual claim. This isn't just UX — it's an auditable hallucination detection system. Users can click any citation to verify. This transparency is itself a metric: citation click-through rate indicates user trust level."
      },
      {
        text: "Human Override Rate shows how often users reject or correct the AI's output. A high override rate might mean the AI isn't useful, or it might mean users don't trust it yet.",
        advancedText: "Override rate decomposition: type of override (reject entirely vs. edit partially), timing (immediate rejection vs. edit after review), and pattern analysis (does the same user always override, or is it specific query types?). Each sub-metric tells a different story.",
        example: "Imagine a spell-checker where people click 'ignore suggestion' 80% of the time. Either the suggestions are bad, or people just prefer their original wording. The PM needs to investigate which.",
        advancedExample: "GitHub Copilot found that acceptance rates vary wildly by language (Python > Java > C++) and by suggestion length (single-line > multi-line). This granular override data drove their decision to invest in multi-line completion quality."
      },
      {
        text: "Safety metrics (toxic output rate, bias detection, policy violations) are business-critical, not just ethical concerns. One viral incident of harmful AI output can destroy product trust overnight.",
        advancedText: "Safety metrics framework: toxicity detection (automated classifiers), bias auditing (demographic parity across user groups), policy compliance (PII leakage, copyright, harmful instructions), and red-team results (adversarial attack success rate). Track these in CI/CD, not just production.",
        example: "Think of it like food safety at a restaurant chain. One contamination incident at one location makes national news and affects every location. AI safety metrics are your 'food safety inspections.'",
        advancedExample: "Anthropic's Claude uses Constitutional AI — the model is trained to self-evaluate against a set of principles. This isn't just a safety feature; it's a measurable system where you can track how often the model self-corrects vs. produces violations."
      }
    ],
    quiz: [
      {
        question: "Why are traditional product metrics 'necessary but insufficient' for AI products?",
        options: [
          "Because traditional metrics are outdated and should be replaced",
          "Because AI products don't have users",
          "Because you also need AI-specific metrics to know if the AI itself works correctly",
          "Because investors only care about AI metrics"
        ],
        answer: 2,
        learnLinks: [
          { title: "AI Product Metrics Every PM Should Know", url: "https://www.youtube.com/results?search_query=AI+product+metrics+for+product+managers&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What does Task Completion Rate measure?",
        options: [
          "How often the AI successfully finishes what the user asked",
          "How fast the AI responds",
          "How many users complete onboarding",
          "How many tasks the PM completes per sprint"
        ],
        answer: 0,
        learnLinks: [
          { title: "Task Completion Rate for AI", url: "https://www.youtube.com/results?search_query=AI+task+completion+rate+metric+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "A medical AI with a 2% hallucination rate is:",
        options: [
          "Excellent — 98% accuracy is very high",
          "Acceptable if the AI is fast",
          "Irrelevant — doctors will catch all errors",
          "Potentially disqualifying — in high-stakes domains, even small error rates are dangerous"
        ],
        answer: 3,
        learnLinks: [
          { title: "AI Hallucination in Healthcare", url: "https://www.youtube.com/results?search_query=AI+hallucination+rate+healthcare+risk&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "If users override the AI 80% of the time, a PM should:",
        options: [
          "Remove the AI feature immediately",
          "Ignore it — users always resist change",
          "Investigate whether the AI suggestions are poor or users simply don't trust it yet",
          "Increase the AI's confidence level"
        ],
        answer: 2,
        learnLinks: [
          { title: "Human-AI Override Patterns", url: "https://www.youtube.com/results?search_query=human+override+AI+product+design&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "How does GitHub Copilot measure if its AI suggestions are useful?",
        options: [
          "By counting how many lines of code it generates per day",
          "By tracking acceptance rate — how often developers accept vs. reject suggestions",
          "By measuring how fast the model responds",
          "By surveying developers once a year"
        ],
        answer: 1,
        toolQuestion: true,
        learnLinks: [
          { title: "Copilot Metrics That Matter", url: "https://www.youtube.com/results?search_query=github+copilot+acceptance+rate+metrics&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  },
  {
    day: 5,
    theme: "AI Safety & Governance — Why It's a PM Problem",
    emoji: "\uD83D\uDEE1\uFE0F",
    color: "#10B981",
    briefing: [
      {
        text: "AI safety has three layers: input safety (filtering what goes in), output safety (filtering what comes out), and behavioral safety (controlling what the AI does between input and output).",
        advancedText: "Technical safety stack: input classifiers (detect prompt injection, jailbreaks, PII), output filters (toxicity classifiers, fact-checking, format validation), and behavioral constraints (tool-use permissions, rate limiting, human-in-the-loop gates). Each layer uses different ML models and rule systems.",
        example: "Think of it like airport security. Input safety is the luggage scanner (checking what comes in). Output safety is customs (checking what leaves). Behavioral safety is air traffic control (managing what happens in between).",
        advancedExample: "Claude Code implements all three: input safety (refuses to write malware), behavioral safety (asks permission before destructive commands like rm -rf), output safety (won't generate API keys or credentials in responses)."
      },
      {
        text: "Guardrails are safety rules built around AI systems. They filter harmful inputs, block dangerous outputs, and prevent the AI from taking risky actions — even if the user asks it to.",
        advancedText: "Guardrail implementation patterns: regex/keyword filters (fast, brittle), classifier models (ML-based, more robust), constitutional AI (self-evaluation against principles), and output parsers (structured validation). Layer these — no single guardrail is sufficient.",
        example: "Imagine guardrails on a mountain highway. The car (AI) can drive freely on the road, but the rails prevent it from going off a cliff. You don't remove them just because most drivers are careful.",
        advancedExample: "OpenHands has guardrails that prevent its AI agent from: deleting files outside the project directory, running sudo commands, accessing environment variables with secrets, or making network requests to internal services. Each is a specific constraint in the agent's tool permissions."
      },
      {
        text: "The EU AI Act classifies AI systems by risk level: unacceptable (banned), high-risk (heavy regulation), limited risk (transparency required), and minimal risk (no requirements). PMs need to know where their product falls.",
        advancedText: "EU AI Act specifics: high-risk includes biometric systems, critical infrastructure, education/employment decisions, and law enforcement. Requirements include: risk assessments, data governance, human oversight, transparency documentation, and conformity assessments. Non-compliance penalties: up to 7% of global annual turnover.",
        example: "Think of it like food labeling regulations. Baby formula (high-risk) has strict rules. A restaurant menu (limited risk) needs allergen info. A water bottle (minimal risk) needs basic labeling. Your AI product fits somewhere on this spectrum.",
        advancedExample: "If you build an AI hiring tool (resume screener, interview bot), it's classified as high-risk under the EU AI Act. You'll need: a bias audit, human oversight mechanism, transparency documentation for candidates, and a conformity assessment before deployment."
      },
      {
        text: "AI governance is 'disaster recovery for AI' — having documented processes for when things go wrong. Who reviews the model? How often? What happens when it generates harmful content?",
        advancedText: "AI governance framework: model cards (document capabilities/limitations), incident response playbooks (what to do when AI fails), change management (how to update models safely), audit trails (every model decision logged), and responsibility assignment (RACI matrix for AI decisions).",
        example: "Think of it like a hospital's emergency protocols. You don't create them during a crisis — you prepare them in advance. AI governance means having a playbook ready before your model has its first bad day.",
        advancedExample: "Anthropic publishes a Responsible Scaling Policy that defines capability thresholds — if Claude demonstrates certain capabilities (like autonomously hacking systems), specific safety measures automatically trigger. This is governance as code, not just a PDF."
      },
      {
        text: "As a PM, you own the safety narrative. Engineers build the guardrails, but PMs define what 'safe' means for the product, set acceptable risk thresholds, and communicate tradeoffs to stakeholders.",
        advancedText: "PM safety responsibilities: define acceptable failure modes, set risk thresholds per feature, own the incident response process, communicate safety tradeoffs to leadership, and ensure compliance with regional regulations. Safety is a product feature, not a tax — it's what separates shipping from lawsuit.",
        example: "Think of it like a product recall decision at a car company. Engineers can identify the defect, but the PM decides the recall threshold — how many incidents trigger action? That judgment call is yours.",
        advancedExample: "When Claude refuses to help with something that's actually safe, that's a false positive. When it helps with something harmful, that's a false negative. The PM decides the tradeoff: more false positives (frustrated users) vs. more false negatives (safety risk). There's no 'right' answer — it's a product decision."
      }
    ],
    quiz: [
      {
        question: "What are the three layers of AI safety?",
        options: [
          "Speed, accuracy, and cost",
          "Input safety, output safety, and behavioral safety",
          "Data, model, and deployment",
          "User, admin, and developer safety"
        ],
        answer: 1,
        learnLinks: [
          { title: "AI Safety Layers Explained", url: "https://www.youtube.com/results?search_query=AI+safety+layers+input+output+behavioral&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What's the best analogy for AI guardrails?",
        options: [
          "A speed limit sign that drivers can ignore",
          "A lock on a door that only admins can open",
          "Guardrails on a mountain highway — they prevent the AI from going off a cliff",
          "A seatbelt that's optional for passengers"
        ],
        answer: 2,
        learnLinks: [
          { title: "AI Guardrails for Product Teams", url: "https://www.youtube.com/results?search_query=AI+guardrails+explained+product+management&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Under the EU AI Act, a 'high-risk' AI system must:",
        options: [
          "Be immediately banned",
          "Only be used by government agencies",
          "Just add a small disclaimer",
          "Comply with heavy regulation including bias audits and human oversight"
        ],
        answer: 3,
        learnLinks: [
          { title: "EU AI Act Risk Categories", url: "https://www.youtube.com/results?search_query=EU+AI+Act+risk+classification+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "AI governance is best described as:",
        options: [
          "The government's responsibility, not the company's",
          "A one-time setup during product launch",
          "Documented processes for when things go wrong — disaster recovery for AI",
          "Only needed for consumer-facing products"
        ],
        answer: 2,
        learnLinks: [
          { title: "AI Governance Framework", url: "https://www.youtube.com/results?search_query=AI+governance+framework+product+management&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What safety feature does OpenHands use to prevent its AI agent from causing damage?",
        options: [
          "It only runs in read-only mode",
          "Tool permission constraints — blocking file deletion outside the project, sudo commands, and secret access",
          "It emails the user before every action",
          "It has no safety features — it's fully autonomous"
        ],
        answer: 1,
        toolQuestion: true,
        learnLinks: [
          { title: "AI Agent Safety Patterns", url: "https://www.youtube.com/results?search_query=AI+agent+safety+sandboxing+permissions&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  },
  {
    day: 6,
    theme: "Multimodal AI — Beyond Text",
    emoji: "\uD83C\uDFA8",
    color: "#3B82F6",
    briefing: [
      {
        text: "Multimodal AI processes and generates multiple content types: text, images, audio, and video. Instead of separate tools for each, one model handles them all.",
        advancedText: "Modern multimodal models (GPT-4o, Gemini, Claude) use unified architectures that encode all modalities into a shared embedding space. This enables cross-modal reasoning: 'describe this image', 'generate an image matching this text', 'transcribe this audio and summarize it'.",
        example: "Think of it like a Swiss Army knife vs. carrying separate tools. Instead of one app for text, one for images, and one for audio, a multimodal AI handles everything in a single conversation.",
        advancedExample: "NotebookLM takes documents (text) and generates podcast-style audio discussions about them. That's text→audio multimodal transformation — it's not just reading the text aloud, it's creating a conversational format with two AI hosts discussing the content."
      },
      {
        text: "The key modalities are: text-to-text (traditional chat), text-to-image (DALL-E, Midjourney), image-to-text (describing photos), speech-to-text (transcription), and text-to-speech (narration).",
        advancedText: "Emerging modalities: text-to-video (Sora, Runway), text-to-3D (Point-E, Shap-E), text-to-music (Suno, Udio), and code-to-UI (v0). Each has different maturity levels, costs, and latency profiles. PMs need to know which are production-ready vs. experimental.",
        example: "Imagine a universal translator at the United Nations — but instead of translating between languages, it translates between formats. You speak, it writes. You sketch, it describes. You type, it draws.",
        advancedExample: "v0 by Vercel is a text-to-UI multimodal tool: you describe a component ('a dark mode pricing page with monthly/annual toggle'), and it generates production React code. It can also take a screenshot as input and recreate the UI in code."
      },
      {
        text: "For PMs, multimodal AI means rethinking input methods. Users shouldn't have to type when they could speak, photograph, or draw. The best input method depends on context.",
        advancedText: "Multimodal UX principles: (1) Don't force modality choice — let the AI auto-detect input type. (2) Provide modality switching mid-conversation. (3) Match output modality to context (voice response while driving, visual while browsing). (4) Handle graceful degradation when a modality isn't available.",
        example: "Think of it like ordering food. Sometimes you want to type a search (text), sometimes point at the menu (image), sometimes ask the waiter (voice). A great restaurant lets you do any of these. Your AI product should too.",
        advancedExample: "Bolt.new accepts text descriptions, screenshots, or even hand-drawn sketches as input. The AI interprets whatever modality you provide and generates a full-stack app. This 'bring any input' philosophy is multimodal UX done right."
      },
      {
        text: "Adaptive interfaces change based on context: voice-first while driving, visual while browsing, text while in a meeting. The AI decides the best modality, not just the user.",
        advancedText: "Adaptive modality selection signals: device type (phone mic = voice-ready), motion sensors (moving = likely driving), ambient noise level, screen state (active vs. locked), time of day, and user history. Building this context awareness is an engineering challenge but a product differentiator.",
        example: "Imagine a GPS that automatically switches from visual map to voice directions when it detects you're driving, then back to the map when you're parked. That's adaptive — the interface fits the moment.",
        advancedExample: "This app (AI PM Daily) uses adaptive modality: you can read the briefings (visual) or listen to them (audio) based on whether you're at your desk or commuting. A future version could auto-detect driving mode via the phone's gyroscope."
      },
      {
        text: "The PM challenge with multimodal: each modality has different error rates, latencies, and costs. An image generation that takes 30 seconds might be fine for creative work but terrible for customer support.",
        advancedText: "Multimodal cost comparison: text generation (~$0.01/1K tokens), image generation (~$0.04/image), audio transcription (~$0.006/min), video generation (~$0.10-$1.00/second). PMs must understand these cost structures to build sustainable products. Latency: text <1s, images 5-30s, video 1-5min.",
        example: "Think of it like shipping options at an e-commerce store. Same-day delivery (text response) is fast but limited. Standard shipping (image generation) takes longer but delivers more. The PM picks the right speed for each use case.",
        advancedExample: "Lovable generates full-stack apps in 30-60 seconds. Replit Agent might take 2-3 minutes for complex apps. The PM tradeoff: faster generation with more errors (Lovable) vs. slower but more thorough (Replit). Neither is 'better' — it depends on the use case."
      }
    ],
    quiz: [
      {
        question: "What makes AI 'multimodal'?",
        options: [
          "It can run on multiple devices",
          "It supports multiple languages",
          "It processes and generates multiple content types — text, images, audio, video",
          "It can be used by multiple users simultaneously"
        ],
        answer: 2,
        learnLinks: [
          { title: "Multimodal AI Explained", url: "https://www.youtube.com/results?search_query=multimodal+AI+explained+simply&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Which is NOT a standard AI modality pairing?",
        options: [
          "Text-to-image (generating pictures from descriptions)",
          "Speech-to-text (transcribing audio)",
          "Weight-to-temperature (measuring physical properties)",
          "Image-to-text (describing photographs)"
        ],
        answer: 2,
        learnLinks: [
          { title: "AI Modalities Explained", url: "https://www.youtube.com/results?search_query=AI+modalities+text+image+audio+video+explained&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What's an 'adaptive interface' in the context of multimodal AI?",
        options: [
          "An interface that adapts its color scheme to preferences",
          "An interface that only works on adaptive devices",
          "An interface that adapts its price based on demand",
          "An interface that changes modality based on context — voice while driving, visual while browsing"
        ],
        answer: 3,
        learnLinks: [
          { title: "Adaptive AI Interfaces", url: "https://www.youtube.com/results?search_query=adaptive+AI+interface+multimodal+product+design&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "For a PM, the key challenge with multimodal AI is:",
        options: [
          "Making all modalities look the same",
          "Each modality has different error rates, latencies, and costs that affect product decisions",
          "Choosing only one modality and ignoring the rest",
          "Ensuring the AI is multimodal in name only"
        ],
        answer: 1,
        learnLinks: [
          { title: "Multimodal AI Product Challenges", url: "https://www.youtube.com/results?search_query=multimodal+AI+product+management+challenges&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What makes NotebookLM's audio feature a multimodal innovation?",
        options: [
          "It reads documents aloud word-for-word using text-to-speech",
          "It transforms text documents into podcast-style conversations between two AI hosts",
          "It only works with audio file inputs",
          "It translates documents into different languages"
        ],
        answer: 1,
        toolQuestion: true,
        learnLinks: [
          { title: "NotebookLM Audio Overview Feature", url: "https://www.youtube.com/results?search_query=NotebookLM+audio+overview+podcast+feature&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  },
  {
    day: 7,
    theme: "The AI-Native PM Playbook",
    emoji: "\uD83D\uDE80",
    color: "#EF4444",
    briefing: [
      {
        text: "AI-native PM thinking is fundamentally different: instead of 'what screens do users need?', you ask 'what outcomes do users want, and can AI get them there with fewer steps?'",
        advancedText: "The AI-native PM framework: (1) Define the outcome, not the interface. (2) Map the current user journey's friction points. (3) For each friction point, ask: can AI eliminate this step entirely? (4) Design the minimal human touchpoint. (5) Measure task completion, not feature usage.",
        example: "Think of it like the shift from horse-drawn carriages to cars. Carriage makers optimized for better seats and smoother wheels. Car makers asked: 'What if you didn't need the horse at all?' AI-native PMs skip the horse.",
        advancedExample: "Bolt.new embodies AI-native thinking: instead of 'what IDE features do developers need?', they asked 'what if you didn't need an IDE at all?' Describe the app → get the app. The entire development workflow is collapsed into a single prompt."
      },
      {
        text: "Speed of learning is the new competitive moat. The AI product that learns from user feedback fastest wins — not the one with the best initial model. Your feedback loops are your product.",
        advancedText: "Feedback loop architecture: (1) Implicit signals (acceptance rate, edit distance, time-to-override). (2) Explicit signals (thumbs up/down, regenerate clicks). (3) Behavioral signals (do users come back?). Feed these into model improvement pipelines. Companies with faster feedback loops will compound advantages.",
        example: "Think of it like Spotify's Discover Weekly. The first playlist might be mediocre, but it learns your taste faster than any competitor. After a few weeks, it feels like it knows you. That learning speed IS the product.",
        advancedExample: "Cursor's competitive advantage isn't just their model — it's their feedback loop. Every accepted/rejected suggestion trains their next model. With millions of developers generating training data daily, they're building a flywheel that new competitors can't easily replicate."
      },
      {
        text: "Probabilistic thinking replaces deterministic thinking. Traditional software: if X, then always Y. AI products: if X, then probably Y (85% of the time). PMs must design for uncertainty.",
        advancedText: "Probabilistic UX patterns: confidence indicators ('I'm 90% sure this is correct'), graceful degradation (fallback to simpler behavior when confidence is low), progressive disclosure (show AI's reasoning when confidence is borderline), and A/B testing with statistical significance (not just vibes).",
        example: "Think of it like weather forecasts vs. train schedules. A train schedule is deterministic (departs at 9:00 AM). A weather forecast is probabilistic (80% chance of rain). AI products are weather forecasts — you design for 'probably,' not 'definitely.'",
        advancedExample: "When Lovable generates an app that has a bug, it doesn't crash — it shows you what went wrong and offers to fix it. That's probabilistic UX: anticipate that 20% of generations will need iteration, and make iteration seamless."
      },
      {
        text: "The new PM role: you can't code the AI yourself, and you can't fully predict its outputs. Your value is in vision (what should the AI do?), empathy (what do users actually need?), and judgment (when to ship vs. wait).",
        advancedText: "AI PM skill stack: (1) Prompt engineering (you should be your product's best prompt writer). (2) Evaluation design (define what 'good' looks like with test cases). (3) Cost modeling (tokens \u00D7 price \u00D7 volume = your COGS). (4) Risk assessment (what's the worst hallucination?). (5) Vendor evaluation (which model provider for which use case).",
        example: "Think of it like a movie director. You don't operate the camera, write every line, or edit every frame. But you decide the story, understand the audience, and make the final call on what makes the cut. That's the AI PM.",
        advancedExample: "Try this exercise: open Claude Code and Cursor side-by-side. Give both the same coding task. Compare the approaches, speed, and accuracy. Being able to evaluate AI tools comparatively is a core AI PM skill."
      },
      {
        text: "The AI-native PM playbook: (1) Start with the user problem, not the technology. (2) Prototype with prompts before building. (3) Measure AI-specific metrics from day one. (4) Build trust through transparency. (5) Ship fast, learn faster.",
        advancedText: "Advanced playbook additions: (6) Build evaluation datasets before building features. (7) Design for model-agnosticism — don't lock into one provider. (8) Create AI-specific incident response plans. (9) Measure cost-per-task, not just cost-per-query. (10) Build internal AI literacy — your team needs to understand what they're shipping.",
        example: "Think of it like launching a food truck before opening a restaurant. Test the menu (prompt prototyping), measure what sells (AI metrics), build regulars through consistency (trust), and expand based on data (ship fast, learn faster).",
        advancedExample: "Practical next step: pick one of the hot tools from this week's lessons (Cursor, v0, Bolt.new, or Claude Code). Build something with it this weekend. Even a simple todo app will teach you more about AI-native product development than any article."
      }
    ],
    quiz: [
      {
        question: "What's the core mindset shift for AI-native PMs?",
        options: [
          "Learn to code machine learning models",
          "Ask 'what outcomes do users want, and can AI get them there with fewer steps?'",
          "Focus on building more screens and features",
          "Eliminate all human touchpoints in the product"
        ],
        answer: 1,
        learnLinks: [
          { title: "AI-Native PM Mindset", url: "https://www.youtube.com/results?search_query=AI+native+product+management+mindset+shift&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Why is 'speed of learning' a competitive moat?",
        options: [
          "Because faster learning means cheaper server costs",
          "Because users prefer products that load quickly",
          "Because investors value learning speed over revenue",
          "Because the AI product that learns from user feedback fastest wins"
        ],
        answer: 3,
        learnLinks: [
          { title: "AI Product Competitive Moats", url: "https://www.youtube.com/results?search_query=AI+product+competitive+moat+learning+speed&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "How does probabilistic thinking differ from deterministic thinking?",
        options: [
          "Probabilistic is slower but more accurate",
          "They're the same thing with different names",
          "Deterministic: if X, always Y. Probabilistic: if X, probably Y — design for uncertainty",
          "Probabilistic means the product works randomly"
        ],
        answer: 2,
        learnLinks: [
          { title: "Probabilistic Thinking for AI PMs", url: "https://www.youtube.com/results?search_query=probabilistic+thinking+AI+product+management&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "What's the FIRST step in the AI-native PM playbook?",
        options: [
          "Choose the most advanced AI model available",
          "Build a comprehensive data pipeline",
          "Hire a team of ML engineers",
          "Start with the user problem, not the technology"
        ],
        answer: 3,
        learnLinks: [
          { title: "AI PM Playbook — Start with the Problem", url: "https://www.youtube.com/results?search_query=AI+product+manager+playbook+user+problem+first&sp=EgIYAQ%253D%253D" }
        ]
      },
      {
        question: "Which tool lets you go from a text description to a deployed full-stack app without any local setup?",
        options: [
          "GitHub Copilot — it autocompletes code in your IDE",
          "Bolt.new — describe the app in the browser and it builds and deploys it live",
          "Figma — it's a design tool, not a code generator",
          "Jira — it manages tasks, not generates code"
        ],
        answer: 1,
        toolQuestion: true,
        learnLinks: [
          { title: "Bolt.new Full Demo", url: "https://www.youtube.com/results?search_query=bolt.new+AI+app+builder+demo&sp=EgIYAQ%253D%253D" }
        ]
      }
    ]
  }
];
