# Whisper Engine - Installation & Setup Guide

## 🚀 Quick Start (5 minutes)

### Option 1: Automatic Setup (Recommended)

```bash
# Run the one-click setup script
node setup-engine.mjs
```

This will:

- ✅ Check your Node.js version
- ✅ Install all dependencies
- ✅ Configure TypeScript
- ✅ Setup Tailwind plugin
- ✅ Add sample data (optional)
- ✅ Create starter examples

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

#### 2. Configure API Keys

Create a `.env.local` file:

```bash
# Optional: Pre-configure API keys
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_GEMINI_API_KEY=...
```

Or configure via UI at `/engine` after starting the dev server.

#### 3. Start Development Server

```bash
npm run dev
```

#### 4. Access Engine Dashboard

Open [http://localhost:3000/engine](http://localhost:3000/engine)

---

## 📦 Installation for Existing Projects

### Install in Your Next.js Project

1. **Copy Engine Directory**

```bash
# Copy the entire engine directory to your project
cp -r ./engine /path/to/your/project/
```

2. **Install Required Dependencies**

```bash
cd /path/to/your/project
npm install nanoid localforage jszip @babel/standalone
```

3. **Add Tailwind Plugin (Optional)**

```javascript
// tailwind.config.js
module.exports = {
  plugins: [require("./tailwind-engine-plugin")],
};
```

4. **Import and Use**

```typescript
// In any component or page
import { engineService } from "@/engine/core/engineService";
import { quickChat } from "@/engine/utils/engineHelpers";

// Use the engine
const response = await quickChat("Hello!");
```

---

## 🎯 First Steps After Installation

### 1. Configure Your LLM Provider

```typescript
import { setupProvider } from "@/engine/utils/engineHelpers";

// Setup OpenAI
await setupProvider("openai", "sk-your-api-key");

// Or Gemini
await setupProvider("gemini", "your-api-key");
```

### 2. Try a Quick Chat

```typescript
import { quickChat } from "@/engine/utils/engineHelpers";

const response = await quickChat("What is TypeScript?");
console.log(response);
```

### 3. Load Sample Data (Optional)

```typescript
import { seedSampleData } from "@/engine/utils/sampleData";

// Add realistic sample tasks
seedSampleData();
```

### 4. Explore the Dashboard

Navigate to `/engine` in your browser to:

- View all capabilities
- Check system status
- Manage configurations
- View analytics

---

## 🔧 VSCode Setup

### 1. Install Snippets

Snippets are automatically available in `.vscode/whisper-engine.code-snippets`

**Usage:**

- Type `wq-` and press Tab to see all snippets
- `wq-chat` - Quick chat example
- `wq-gen` - Generate code
- `wq-task` - Create task
- `wq-component` - Full React component

### 2. Enable IntelliSense

TypeScript will automatically provide autocomplete for:

- `engine Service` methods
- Helper functions
- Type definitions
- Event types

### 3. Recommended Extensions

- **TypeScript**: Syntax highlighting
- **Tailwind CSS IntelliSense**: CSS autocomplete
- **ESLint**: Code linting
- **Prettier**: Code formatting

---

## 📚 Usage Examples

### Basic AI Chat

```typescript
import { quickChat } from "@/engine/utils/engineHelpers";

const answer = await quickChat("Explain recursion in simple terms", {
  systemPrompt: "You are a helpful tutor",
  temperature: 0.7,
});
```

### Code Generation

```typescript
import { generateCode } from "@/engine/utils/engineHelpers";

const code = await generateCode(
  "A React hook for detecting click outside",
  "typescript",
  "Using useEffect and useRef",
);
```

### Task Management

```typescript
import { createTask, findTasks } from "@/engine/utils/engineHelpers";

// Create a task
createTask("Implement login", {
  summary: "Added JWT auth",
  outcome: "success",
  tags: ["auth", "backend"],
});

// Search tasks
const authTasks = findTasks("authentication");
```

### Streaming Responses

```typescript
import { streamChat } from "@/engine/utils/engineHelpers";

for await (const chunk of streamChat("Write a poem")) {
  process.stdout.write(chunk);
}
```

### React Component

```tsx
"use client";

import { useState } from "react";
import { quickChat } from "@/engine/utils/engineHelpers";

export default function ChatDemo() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleChat = async () => {
    const result = await quickChat(input);
    setResponse(result);
  };

  return (
    <div className="p-6">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="engine-input mb-4"
        placeholder="Ask anything..."
      />
      <button onClick={handleChat} className="engine-button-primary">
        Send
      </button>
      {response && (
        <div className="mt-4 engine-card">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Tailwind Utilities

The engine includes custom Tailwind utilities:

### Gradients

```html
<div className="gradient-ai">AI Gradient</div>
<div className="gradient-success">Success</div>
<div className="gradient-warning">Warning</div>
```

### Glass Morphism

```html
<div className="glass p-6 rounded-lg">Glass effect container</div>
```

### Components

```html
<div className="engine-card">Card</div>
<button className="engine-button-primary">Button</button>
<input className="engine-input" />
<span className="engine-badge-success">Success</span>
```

### Neon Effects

```html
<h1 className="neon-purple">Neon Text</h1>
```

---

## 🔐 Security Best Practices

1. **Never commit API keys**

```bash
# Add to .gitignore
.env.local
.env*.local
```

2. **Use environment variables**

```javascript
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
```

3. **Configure via UI**

- Keys are encrypted in localStorage
- Separate from exported config
- Can be cleared independently

---

## 🧪 Testing Your Setup

### 1. Check Engine Status

```typescript
import { engineService } from "@/engine/core/engineService";

const status = engineService.getStatus();
console.log({
  version: status.version,
  initialized: status.initialized,
  services: status.activeServices,
  health: status.health,
});
```

### 2. Test LLM Connection

```typescript
import { getCurrentProvider, quickChat } from "@/engine/utils/engineHelpers";

const provider = getCurrentProvider();
console.log("Provider:", provider);

if (provider.hasApiKey) {
  const test = await quickChat("Say hi!");
  console.log("Response:", test);
}
```

### 3. Check Console

Open browser console and look for:

```
[EngineService] Initializing Whisper Engine v2.0.0
[EngineService] Engine initialized successfully
💡 Whisper Engine seed functions available at window.whisperSeed
```

---

## 🐛 Troubleshooting

### Issue: "Missing API key"

**Solution:** Configure provider via UI or code:

```typescript
await setupProvider("openai", "your-key");
```

### Issue: "Module not found"

**Solution:** Install dependencies:

```bash
npm install nanoid localforage jszip @babel/standalone
```

### Issue: TypeScript errors

**Solution:** Ensure tsconfig includes engine:

```json
{
  "include": ["engine/**/*", "app/**/*"]
}
```

### Issue: Tailwind classes not working

**Solution:** Add plugin to tailwind.config.js

---

## 📖 Next Steps

1. ✅ **Explore Dashboard**: Visit `/engine`
2. ✅ **Read Documentation**: Check `engine/README.md`
3. ✅ **Try Snippets**: Use VSCode snippets (`wq-`)
4. ✅ **Build Something**: Create your first AI-powered feature
5. ✅ **Check Examples**: See sample data and conversations

---

## 💡 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📞 Support

For issues or questions:

1. Check the inline TypeScript documentation
2. Explore the Engine Dashboard at `/engine`
3. Review sample data and examples
4. Check browser console for detailed logs

---

**🎉 You're ready to build with Whisper Engine!**

Visit `/engine` to start exploring all capabilities.
