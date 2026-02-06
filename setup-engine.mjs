#!/usr/bin/env node

/**
 * Whisper Engine One-Click Setup
 * Automated installation and configuration script
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, "green");
}

function info(message) {
  log(`ℹ️  ${message}`, "blue");
}

function warn(message) {
  log(`⚠️  ${message}`, "yellow");
}

function error(message) {
  log(`❌ ${message}`, "red");
}

function header(message) {
  console.log();
  log(`${"=".repeat(60)}`, "cyan");
  log(`  ${message}`, "bright");
  log(`${"=".repeat(60)}`, "cyan");
  console.log();
}

async function checkNodeVersion() {
  info("Checking Node.js version...");
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0]);

  if (major < 18) {
    error(
      `Node.js ${major} detected. Whisper Engine requires Node.js 18 or higher.`,
    );
    process.exit(1);
  }

  success(`Node.js ${version} detected`);
}

async function checkDependencies() {
  info("Checking required dependencies...");

  try {
    const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
    const required = ["nanoid", "localforage", "jszip", "@babel/standalone"];
    const missing = required.filter(
      (dep) =>
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep],
    );

    if (missing.length > 0) {
      warn(`Missing dependencies: ${missing.join(", ")}`);
      return false;
    }

    success("All required dependencies found");
    return true;
  } catch (err) {
    error("Could not read package.json");
    return false;
  }
}

async function installDependencies() {
  info("Installing dependencies...");

  try {
    execSync("npm install nanoid localforage jszip @babel/standalone", {
      stdio: "inherit",
    });
    success("Dependencies installed successfully");
  } catch (err) {
    error("Failed to install dependencies");
    throw err;
  }
}

async function configureTailwind() {
  info("Configuring Tailwind plugin...");

  const configPath = "tailwind.config.js";

  if (!existsSync(configPath)) {
    warn("tailwind.config.js not found, skipping...");
    return;
  }

  try {
    let config = readFileSync(configPath, "utf-8");

    if (config.includes("tailwind-engine-plugin")) {
      success("Tailwind plugin already configured");
      return;
    }

    // Add plugin to config
    if (config.includes("plugins:")) {
      config = config.replace(
        /plugins:\s*\[/,
        "plugins: [\n    require('./tailwind-engine-plugin'),",
      );
    } else {
      config = config.replace(
        /}\s*$/,
        ",\n  plugins: [\n    require('./tailwind-engine-plugin'),\n  ],\n}",
      );
    }

    writeFileSync(configPath, config);
    success("Tailwind plugin configured");
  } catch (err) {
    warn("Could not configure Tailwind plugin automatically");
  }
}

async function setupTypeScript() {
  info("Checking TypeScript configuration...");

  const tsconfigPath = "tsconfig.json";

  if (!existsSync(tsconfigPath)) {
    warn("tsconfig.json not found, skipping...");
    return;
  }

  try {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));

    // Ensure engine is included
    if (!tsconfig.include) {
      tsconfig.include = [];
    }

    if (!tsconfig.include.includes("engine/**/*")) {
      tsconfig.include.push("engine/**/*");
      writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      success("TypeScript configuration updated");
    } else {
      success("TypeScript configuration OK");
    }
  } catch (err) {
    warn("Could not update TypeScript configuration");
  }
}

async function setupSampleData() {
  const answer = await question(
    "\n💡 Would you like to load sample data for demo? (y/N): ",
  );

  if (answer.toLowerCase() === "y") {
    info("Sample data will be loaded on first run");
    info("Use: window.whisperSeed.seed() in browser console");
    success("Sample data setup configured");
  } else {
    info("Skipping sample data");
  }
}

async function createStarterExample() {
  const answer = await question(
    "\n💡 Create a starter example component? (y/N): ",
  );

  if (answer.toLowerCase() !== "y") {
    info("Skipping starter example");
    return;
  }

  const exampleDir = join("app", "examples");
  if (!existsSync(exampleDir)) {
    mkdirSync(exampleDir, { recursive: true });
  }

  const exampleContent = `'use client'

import { useState } from 'react'
import { quickChat, showToast } from '@/engine/utils/engineHelpers'

export default function StarterExample() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChat = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    try {
      const result = await quickChat(input, {
        systemPrompt: 'You are a helpful AI assistant',
      })
      setResponse(result)
      showToast('Response received!', 'info')
    } catch (error) {
      showToast('Error: ' + (error as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          Whisper Engine Starter
        </h1>
        
        <div className="engine-card mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="engine-input mb-4"
            rows={4}
            placeholder="Ask me anything..."
          />
          
          <button
            onClick={handleChat}
            disabled={loading || !input.trim()}
            className="engine-button-primary w-full"
          >
            {loading ? 'Thinking...' : 'Send Message'}
          </button>
        </div>
        
        {response && (
          <div className="engine-panel">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Response:</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  )
}
`;

  writeFileSync(join(exampleDir, "page.tsx"), exampleContent);
  success("Starter example created at /examples");
}

async function finalChecks() {
  info("Running final checks...");

  const checks = [
    { name: "Engine core files", path: "engine/core/engineService.ts" },
    { name: "Helper utilities", path: "engine/utils/engineHelpers.ts" },
    { name: "Dashboard component", path: "components/EngineDashboard.tsx" },
    { name: "Engine route", path: "app/engine/page.tsx" },
  ];

  let allGood = true;

  for (const check of checks) {
    if (existsSync(check.path)) {
      success(`${check.name} ✓`);
    } else {
      error(`${check.name} ✗`);
      allGood = false;
    }
  }

  return allGood;
}

async function printNextSteps() {
  console.log();
  header("🎉 Setup Complete!");

  log("Next steps:", "bright");
  console.log();
  log("  1. Start the development server:", "cyan");
  log("     npm run dev", "green");
  console.log();
  log("  2. Configure your LLM provider at:", "cyan");
  log("     http://localhost:3000/engine", "green");
  console.log();
  log("  3. Try the starter example:", "cyan");
  log("     http://localhost:3000/examples", "green");
  console.log();
  log("  4. Use VSCode snippets:", "cyan");
  log('     Type "wq-" and press Tab', "green");
  console.log();
  log("  5. Load sample data (in browser console):", "cyan");
  log("     window.whisperSeed.seed()", "green");
  console.log();
  log("📚 Documentation:", "bright");
  log("  - Installation Guide: INSTALLATION.md", "blue");
  log("  - Engine README: engine/README.md", "blue");
  console.log();
  log("💡 Quick command to configure provider:", "bright");
  log('  await setupProvider("openai", "your-api-key")', "green");
  console.log();
  success("Happy coding with Whisper Engine! 🚀");
  console.log();
}

async function main() {
  header("Whisper Engine - One-Click Setup");

  try {
    await checkNodeVersion();

    const hasAllDeps = await checkDependencies();
    if (!hasAllDeps) {
      await installDependencies();
    }

    await configureTailwind();
    await setupTypeScript();
    await setupSampleData();
    await createStarterExample();

    const allChecksPass = await finalChecks();

    if (allChecksPass) {
      await printNextSteps();
    } else {
      warn("Setup completed with warnings. Check the errors above.");
    }
  } catch (err) {
    console.error();
    error("Setup failed:");
    console.error(err);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
