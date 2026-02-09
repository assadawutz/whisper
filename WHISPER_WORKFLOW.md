# 🏛️ WHISPER STUDIO - WORKFLOW & MENU ARCHITECTURE

เอกสารนี้อธิบายการไหลของระบบ Whisper และเมนูต่างๆ ที่ผู้ใช้จะเห็นใน Studio

---

## 📍 MAIN NAVIGATION TABS

| Tab                  | Route            | Module           | หน้าที่                                   |
| -------------------- | ---------------- | ---------------- | ----------------------------------------- |
| 🏠 **Home**          | `/`              | -                | Dashboard สรุปสถานะระบบ, งานล่าสุด, สถิติ |
| 👁️ **Vision Lab**    | `/vision`        | `whisper-vision` | AI วิเคราะห์โครงสร้างภาพ UI อัตโนมัติ     |
| 📡 **Realtime Scan** | `/realtime-scan` | `whisper-vision` | Upload ภาพ → สแกน OpenCV แบบ Real-time    |
| ✏️ **Design Studio** | `/studio`        | `whisper-studio` | แก้ไข Layer, ปรับ Box, กำหนด Role         |
| ⚡ **Synthesis**     | `/synthesis`     | `whisper-soul`   | เรียก Agent เขียน Code Tailwind           |
| 🤖 **Agents**        | `/agents`        | `whisper-soul`   | ควบคุม/ดู Log ของ AI Personas             |
| ⚙️ **Config**        | `/config`        | `whisper-core`   | ตั้งค่า API Keys และระบบ                  |

---

## 🔄 USER WORKFLOW

```
┌─────────────────────────────────────────────────────────────────┐
│  1. UPLOAD                                                       │
│  └─> Realtime Scan: ลาก/วาง UI Image เข้าระบบ                   │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. SCAN (WhisperVision)                                         │
│  └─> OpenCV Edge Detection → Serpentine Scan → QA Gate          │
│      ผลลัพธ์: รายการ Nodes พร้อม Bounding Boxes                 │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. REFINE (Design Studio)                                       │
│  └─> WhisperEditor: ปรับตำแหน่ง, ขนาด, กำหนด Role               │
│      (Button, Card, Input, Header ฯลฯ)                          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. SYNTHESIZE (WhisperSoul)                                     │
│  └─> เลือก Agent (Penna = Coder) → Gen Tailwind TSX             │
│      ใช้ Format6 Protocol (Plan A/B + Verify Steps)              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. VERIFY (Diff Engine)                                         │
│  └─> เปรียบเทียบ Preview กับ Original Image                     │
│      Pass: < 1% Drift → Export                                  │
│      Fail: → Auto-Fix Loop (กลับไปข้อ 4)                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. EXPORT                                                       │
│  └─> Download TSX / Copy to Clipboard / viewer.html             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 DETAILED MENU ITEMS

### 🏠 Home (`/`) - **EXISTING**

| Menu Item       | Action                   | Module          |
| --------------- | ------------------------ | --------------- |
| Quick Stats     | ดูจำนวน Tasks, สถานะระบบ | `engineService` |
| Start Synthesis | ไปหน้า Synthesis         | Router          |
| Open Studio     | ไปหน้า Studio            | Router          |
| Realtime Scan   | ไปหน้า Realtime Scan     | Router          |

### 👁️ Realtime Scan (`/realtime-scan`) - **EXISTING**

| Menu Item        | Action                       | Module                  |
| ---------------- | ---------------------------- | ----------------------- |
| Upload Image     | เลือกไฟล์ภาพ UI              | FileReader              |
| Load OpenCV      | โหลด OpenCV.js               | `loadOpenCV()`          |
| Scan Mode        | เลือก Border/Grid/Serpentine | `buildGridSerpentine()` |
| Edge Detection   | ตรวจจับขอบด้วย Canny         | OpenCV                  |
| Export Blueprint | ส่ง Nodes ไป Studio          | State                   |

### ✏️ Design Studio (`/studio`) - **EXISTING**

| Menu Item    | Action                        | Module             |
| ------------ | ----------------------------- | ------------------ |
| Select Tool  | เลือก/ย้ายกล่อง               | `WhisperEditor`    |
| Draw Box     | วาดกล่องใหม่ด้วยมือ           | `WhisperEditor`    |
| Assign Role  | กำหนดประเภท (Button, Card...) | `WhisperNode.role` |
| Undo/Redo    | ย้อน/ทำซ้ำ                    | `WhisperEditor`    |
| Preview      | ดูตัวอย่างผลลัพธ์             | `WhisperRenderer`  |
| Agent List   | ดูรายชื่อ Agents              | `AGENT_REGISTRY`   |
| Terminal Log | ดู Console Output             | State              |

### ⚡ Synthesis (`/synthesis`) - **EXISTING**

| Menu Item     | Action                                 | Module            |
| ------------- | -------------------------------------- | ----------------- |
| Upload Image  | เลือกไฟล์ภาพ UI                        | FileReader        |
| Process Steps | สแกน → สกัดสไตล์ → สร้างโค้ด → ตรวจสอบ | `ProcessStep[]`   |
| View Result   | ดูผลลัพธ์ Components                   | `SynthesisResult` |
| Show Code     | ดู/คัดลอก TSX                          | Clipboard         |
| Regenerate    | สร้างโค้ดใหม่                          | `engineService`   |

### 🤖 Agents (`/agents`) - **EXISTING**

| Menu Item       | Action                                           | Module                       |
| --------------- | ------------------------------------------------ | ---------------------------- |
| View All Agents | ดูรายชื่อ Safetia, Miralyn, Penna, Flux, Checkka | `AGENT_REGISTRY`             |
| Agent Logs      | ดู Terminal Output ของแต่ละ Agent                | `whisper-core/core/logger`   |
| Task History    | ดูประวัติงานที่ทำไป                              | `WhisperOrchestrator.list()` |
| Scars (Memory)  | ดูความผิดพลาดที่ระบบจดจำไว้                      | `whisper-core/memory`        |

### ⚙️ Config (`/config`) - **EXISTING**

| Menu Item       | Action                               | Module        |
| --------------- | ------------------------------------ | ------------- |
| API Keys        | ตั้งค่า Gemini/OpenAI/Anthropic Keys | `configStore` |
| Model Selection | เลือก Model ที่ใช้                   | `llmClient`   |
| Save Settings   | บันทึกการตั้งค่า                     | LocalStorage  |

---

## 🧩 MODULE STRUCTURE (EXISTING)

### `whisper-soul` (Intelligence)

```
whisper-soul/
├── WhisperSoul.ts        # AI Agent System (6-Section Protocol)
├── WhisperOrchestrator.ts # Task Management & Approval
├── agentRegistry.ts       # Agent Profiles (Safetia, Penna, etc.)
└── format6.ts             # 6-Section Response Parser
```

### `whisper-vision` (Scanning)

```
whisper-vision/
├── WhisperVision.ts    # Signal Analysis & QA Gate
├── canvas.ts           # Canvas Utilities
├── diff.ts             # Pixel Diff Engine
├── extract.ts          # Box Extraction
├── image.ts            # Image Loading
├── serpentine.ts       # Serpentine Scan Path
├── runner.ts           # Scan Runner
└── exportGate.ts       # Export Validation
```

### `whisper-studio` (Interface)

```
whisper-studio/
├── WhisperEditor.tsx       # Main Structure Editor (32KB)
├── WhisperEditorPanel.tsx  # Side Panel Controls (21KB)
├── WhisperRenderer.tsx     # Preview Renderer
└── overlay/                # Overlay Components
```

### `whisper-core` (Infrastructure)

```
whisper-core/
├── WhisperTypes.ts     # Core Type Definitions
├── layout-tree.ts      # Layout Tree Builder
├── suggestions.ts      # AI Suggestions
├── core/               # Event Bus, Config, Logger, Service
├── llm/                # LLM Client, Types, Streaming
├── memory/             # Task Memory
├── runner/             # Command Runner
├── workspace/          # File Workspace
├── analysis/           # Dependency Graph
├── bundler/            # Code Bundler
├── export/             # Export Utilities
└── utils/              # Helpers, Sample Data
```

---

## 🎯 NEXT.JS ROUTES (EXISTING)

| Route            | Page Component               | Status  | Lines |
| ---------------- | ---------------------------- | ------- | ----- |
| `/`              | `app/page.tsx`               | ✅ Done | 208   |
| `/studio`        | `app/studio/page.tsx`        | ✅ Done | 174   |
| `/realtime-scan` | `app/realtime-scan/page.tsx` | ✅ Done | 494   |
| `/synthesis`     | `app/synthesis/page.tsx`     | ✅ Done | 398   |
| `/agents`        | `app/agents/page.tsx`        | ✅ Done | -     |
| `/config`        | `app/config/page.tsx`        | ✅ Done | -     |
| `/preview`       | `app/preview/page.tsx`       | ✅ Done | -     |
| `/examples`      | `app/examples/`              | ✅ Done | -     |

---

## ✅ IMPLEMENTATION STATUS

### Core Modules

| Feature            | Status  | File                     |
| ------------------ | ------- | ------------------------ |
| Whisper Core Types | ✅ Done | `WhisperTypes.ts`        |
| Agent Registry     | ✅ Done | `agentRegistry.ts`       |
| Soul System        | ✅ Done | `WhisperSoul.ts`         |
| Orchestrator       | ✅ Done | `WhisperOrchestrator.ts` |
| Vision Scanner     | ✅ Done | `WhisperVision.ts`       |
| Diff Engine        | ✅ Done | `diff.ts`                |
| Extract Logic      | ✅ Done | `extract.ts`             |
| LLM Client         | ✅ Done | `llm/llmClient.ts`       |
| Event Bus          | ✅ Done | `core/eventBus.ts`       |
| Config Store       | ✅ Done | `core/configStore.ts`    |

### UI Pages

| Feature        | Status  | File                         |
| -------------- | ------- | ---------------------------- |
| Home Dashboard | ✅ Done | `app/page.tsx`               |
| Studio UI      | ✅ Done | `app/studio/page.tsx`        |
| Realtime Scan  | ✅ Done | `app/realtime-scan/page.tsx` |
| Synthesis      | ✅ Done | `app/synthesis/page.tsx`     |
| Agents Panel   | ✅ Done | `app/agents/page.tsx`        |
| Config Page    | ✅ Done | `app/config/page.tsx`        |

### TODO

| Feature         | Priority  | Notes                   |
| --------------- | --------- | ----------------------- |
| Diff Heatmap UI | 🔶 Medium | Visual drift map        |
| Auto-Fix Loop   | 🔴 High   | Connect to Orchestrator |
| Agent Chat UI   | 🔶 Medium | Interactive agent chat  |
| Scars Memory UI | 🟢 Low    | View past failures      |
