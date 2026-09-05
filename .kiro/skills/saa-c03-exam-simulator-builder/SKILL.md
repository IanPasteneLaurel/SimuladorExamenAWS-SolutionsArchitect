# SAA-C03 Exam Simulator Builder

## Description

End-to-end construction of a production-ready AWS SAA-C03 certification exam
simulator. Converts a raw PDF/Markdown question bank into a full-stack React
application with intelligent question distribution, multiple study modes, and
deployment-ready architecture. Designed for AWS consultants building study
tools as lead magnets.

## Scope & Capability

### 1. PDF/Markdown Extraction & Parsing

- Parse large question banks (800+ questions) into structured data
- Extract question text, answer options, correct answers, and explanations
- Organize by AWS Well-Architected Framework domains
- Validate extraction accuracy across 7 QA dimensions
- Output: Clean structured JSON knowledge base with zero data loss

**Domains supported:**

- Design Secure Architectures (~30%)
- Design Resilient Architectures (~26%)
- Design High-Performing Architectures (~24%)
- Design Cost-Optimized Architectures (~20%)
- Design Operationally Excellent Architectures (remaining %)

### 2. Question Bank Structuring

- Distribute questions evenly across multiple full mock exams
- **Zero repetition guarantee**: Each question appears exactly once across all exams
- Default: 14 exams (13x66 questions + 1x65 questions) for 923-question bank
- Support configurable exam lengths and topic-weighted distribution
- Generate JSON exam payloads ready for React consumption

### 3. React Simulator Frontend

- **Full Exam Mode**: Timed practice tests mirroring official exam experience
  - Configurable duration (default: 130 minutes for 65-66 questions)
  - Real-time progress tracking and timer display
  - Question review and flag-for-review functionality
  - End-of-exam score report with domain breakdown
- **Flash Study Mode**: Self-paced targeted study sessions
  - Selectable session sizes (10, 20, 30 questions)
  - No timer; focus on learning
  - Random draw from full question bank
  - Per-question explanations with architectural reasoning
- **Common UI Components**:
  - Question display with formatted options
  - Multi-select and single-select support
  - Explanation panels (instructor-style, not just answer keys)
  - Score summary with domain performance heatmap
  - Navigation and session reset controls

### 4. Data Architecture

- **Storage**: Browser localStorage for exam sessions and progress
- **Delivery**: Static JSON exam datasets (no backend required)
- **State Management**: React hooks (useState, useContext) for exam flow
- **Styling**: Tailwind CSS with custom design tokens for professional UX

### 5. Deployment Pipeline

- **Target**: Vercel for frictionless serverless hosting
- **Setup Automation**: Bash scripts for environment config and dependency installation
- **GitHub Integration**:
  - Web UI upload (for non-technical users)
  - HTTPS CLI with PAT authentication
  - SSH key-based deployment (for advanced users)
- **Documentation**:
  - 00-START-HERE.md (quick-reference guide)
  - Deploy-to-Vercel.md (step-by-step)
  - GitHub-Setup-Guide.md (repo initialization)

### 6. Study Strategy Integration

- Support for diagnostic-first approach: 1 diagnostic exam + 4-5 full mocks
- Reserve question preservation: Track which questions remain unused
- Domain-weighted study recommendations based on AWS official weights
- Progress dashboard showing exam history and trending performance

### 7. Quality Assurance

- **Extraction Validation**: 7-dimension QA (question count, option count,
  answer key consistency, domain assignment, explanation presence,
  formatting, deduplication)
- **UI Testing Checklist**: Navigation, timer accuracy, score calculation,
  local storage persistence, responsive design
- **Deployment Verification**: Vercel build success, live app accessibility,
  GitHub sync confirmation

## Output Artifacts

1. **00-START-HERE.md** - Quick reference and feature overview
2. **SAA-C03-QuestionBank-923.json** - Structured question database (parsed from markdown)
3. **Exam Data JSONs** - `exams-full.json` (14 exam payloads) + `exams-metadata.json`
4. **React Components** - Pages, hooks, UI modules, routing config
5. **Deployment Config** - vercel.json, GitHub workflows, setup scripts
6. **Documentation Set** - Deploy guides, GitHub setup, deployment instructions

## Success Criteria

- All 923 questions distributed with zero repetition
- Simulator runs locally within 30-40 minutes of setup
- Full exam and Flash Study modes fully functional
- Explanations follow instructor-style (architectural reasoning, not just answers)
- Responsive design works on desktop and tablet
- Deployable to Vercel with one-command push
- Study strategy aligns with AWS official exam domain weights
- Lead magnet ready: clean UX, fast load times, free access path clear

## Key Principles

- **Minimal iteration**: Build completely the first time; concise, no back-and-forth
- **No magic**: Every component is inspectable and modifiable by the user
- **Instructor-first explanations**: Not just "the answer is B" - explain *why*
  with architectural principles
- **Diagnostic-first study**: Preserve questions; recommend targeted review
  over linear grinding
- **Vercel-ready from day one**: No backend, no complex DevOps; pure static + browser

## Context & Usage

**Primary User**: AWS consultants studying for SAA-C03 while building a
personal lead magnet

**Secondary Goal**: Repurpose this tool as a case study / demo for consulting
practice

**Time Horizon**: Study period ~4-6 weeks; simulator fully operational by week 1

**Knowledge Base**: External Markdown/JSON file (`SAA-C03-QuestionBank-923.md`
/ `.json`) serves as single source of truth; no inline context saturation on
agent interactions

## Execution Playbook (Option A - Fast Setup)

1. Parse the markdown question bank into `SAA-C03-QuestionBank-923.json`
   (one object per question: id, domain, question_en, question_es, options,
   correct_answer, explanation fields, aws_services, difficulty).
2. Run 7-dimension QA validation on the parsed set (counts, options=4,
   valid answer key, domain assigned, explanation present, formatting clean,
   no duplicate question text).
3. Distribute the validated questions into N exams (default 14: 13x66 + 1x65)
   with zero repetition, preserving overall domain-weight proportions per exam
   where possible. Emit `exams-full.json` + `exams-metadata.json`.
4. Scaffold `app/` with Vite + React + Tailwind + React Router + Recharts +
   lucide-react.
5. Copy data JSONs into `app/src/data/`.
6. Implement hooks (`useQuestions`, `useProgress`, `useTimer`, `useScoring`),
   components (`QuestionView`, `ExplanationView`, `Timer`, `ProgressBar`,
   `ScoreCard`), and pages (`Home`, `ExamMode`, `FlashMode`, `Progress`).
7. Wire routing in `App.jsx`, verify `npm run build` succeeds.
8. Add `vercel.json` for one-command deploy.
9. Report back with exact commands to run locally (`npm install`, `npm run dev`).
