# 🌌 Dream Portal - Automated QA Test Suite

> Production-grade functional test automation and AI-driven classification framework for the **[Dream Portal](https://arjitnigam.github.io/myDreams/)** web application, built with **Playwright**, **TypeScript**, and the **Page Object Model (POM)** pattern.

[![Playwright Tests](https://github.com/Shrinath0209/Automated-Testing-for-Dream-Portal/actions/workflows/playwright.yml/badge.svg)](https://github.com/Shrinath0209/Automated-Testing-for-Dream-Portal/actions/workflows/playwright.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Playwright Version](https://img.shields.io/badge/playwright-v1.50.0-blue.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.7.3-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture & Design](#-architecture--design)
- [Folder Structure](#-folder-structure)
- [Test Coverage](#-test-coverage)
- [AI-Based Classification (Part 2 Bonus)](#-ai-based-classification-part-2-bonus)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
- [Running Tests](#-running-tests)
- [Test Reports & Artifacts](#-test-reports--artifacts)
- [CI/CD Integration](#-cicd-integration)
- [Evaluation Checklist](#-evaluation-checklist)

---

## 🧭 Overview

This test suite automates end-to-end verification of the **Dream Portal** web application, covering:
1. **Home Portal (`index.html`)**: Dynamic loading animations, timing constraints, element visibility transitions, and multi-tab browser dispatch.
2. **Dreams Diary (`dreams-diary.html`)**: Tabular data validation, row counts, column non-emptiness, and domain constraints for dream types.
3. **Dreams Summary (`dreams-total.html`)**: Aggregated metrics calculation, cross-page data consistency, and algorithmic recurring dream verification.
4. **AI-Driven Sentiment Classification**: Intelligent classification of dream descriptions as `Good` or `Bad` using OpenAI API with an offline semantic fallback.

---

## 🏛 Architecture & Design

The framework is structured using industry-standard QA automation patterns:

- **Page Object Model (POM)**: Every web page has an associated Page Object (`DreamPortalPage`, `DreamsDiaryPage`, `DreamsSummaryPage`) encapsulating locators and page-specific user interactions, separating test logic from DOM mechanics.
- **Strict Typing**: Built on TypeScript with custom data interfaces (`DreamEntry`, `DreamSummaryStats`, `AIClassificationResult`) ensuring compile-time safety.
- **Robust Multi-Tab Handling**: Handles multi-page triggers via Playwright's `BrowserContext` event listeners, avoiding arbitrary sleeps and race conditions.
- **Resilient AI Pipeline**: The `AIClassifierService` supports OpenAI's `gpt-4o-mini` when an API key is provided, and gracefully falls back to a deterministic semantic engine when run in offline or keyless environments.

---

## 📂 Folder Structure

```
.
├── .github/
│   └── workflows/
│       └── playwright.yml            # Automated CI pipeline
├── src/
│   ├── config/
│   │   └── env.ts                    # Centralized environment variables
│   ├── models/
│   │   └── dream.model.ts            # Type definitions & data interfaces
│   ├── pages/
│   │   ├── BasePage.ts               # Shared page utilities and screenshot helpers
│   │   ├── DreamPortalPage.ts        # POM for index.html
│   │   ├── DreamsDiaryPage.ts        # POM for dreams-diary.html
│   │   └── DreamsSummaryPage.ts      # POM for dreams-total.html
│   ├── services/
│   │   └── aiClassifier.service.ts   # Hybrid AI / semantic classification engine
│   └── utils/
│       ├── dreamStatsCalculator.ts   # Recurring analysis and statistical calculations
│       └── logger.ts                 # Formatted console logger with log levels
├── tests/
│   ├── 01-dream-portal.spec.ts       # Portal loader and multi-tab dispatch specs
│   ├── 02-dreams-diary.spec.ts       # Diary table row, column, and data integrity specs
│   ├── 03-dreams-total.spec.ts       # Summary statistics and recurring logic specs
│   ├── 04-portal-journey.spec.ts     # End-to-end multi-tab integrated user journey
│   └── 05-ai-validation.spec.ts      # AI-based dream classification validation specs
├── .env.example                      # Configuration template
├── .gitignore                        # Git exclusion rules
├── package.json                      # NPM dependencies and run scripts
├── playwright.config.ts              # Playwright configuration
├── tsconfig.json                     # TypeScript compiler options
└── README.md                         # Framework documentation
```

---

## 🧪 Test Coverage

| Test Suite | File | What is Validated |
|---|---|---|
| **Portal Home** | [`01-dream-portal.spec.ts`](tests/01-dream-portal.spec.ts) | • Loading animation appears on load and hides after ~3s<br>• Main content and "My Dreams" button become visible<br>• Clicking "My Dreams" opens both `dreams-diary.html` and `dreams-total.html` in new tabs |
| **Dreams Diary** | [`02-dreams-diary.spec.ts`](tests/02-dreams-diary.spec.ts) | • Exactly 10 dream entries in `#dreamsDiary`<br>• Dream types are strictly restricted to `"Good"` or `"Bad"`<br>• All rows have non-empty `Dream Name`, `Days Ago`, and `Dream Type` cells |
| **Dreams Summary** | [`03-dreams-total.spec.ts`](tests/03-dreams-total.spec.ts) | • Correct stats: Good: 6, Bad: 4, Total: 10, Recurring: 2<br>• Verifies `"Flying over mountains"` (3x) and `"Lost in maze"` (2x) are counted as recurring<br>• Cross-verifies summary values against raw diary data |
| **E2E Journey** | [`04-portal-journey.spec.ts`](tests/04-portal-journey.spec.ts) | • Full user journey: Landing → Loader completion → Click "My Dreams" → Capture both popup tabs → Cross-validate entries |
| **AI Classification** | [`05-ai-validation.spec.ts`](tests/05-ai-validation.spec.ts) | • Classifies canonical examples (`"Monster chase"` → Bad, `"Flying over mountains"` → Good)<br>• Dynamically extracts all entries from diary table and compares AI classification against table type |

---

## 🧠 AI-Based Classification (Part 2 Bonus)

The assignment requests leveraging OpenAI or an AI model to classify dream titles into `"Good"` or `"Bad"`, comparing the result against the table data.

### How it works:
1. **OpenAI Integration**: If an `OPENAI_API_KEY` is present in the `.env` file, the `AIClassifierService` queries `gpt-4o-mini` with a structured system prompt requesting JSON output (`{"type": "Good" | "Bad", "explanation": "..."}`).
2. **Zero-Configuration Fallback**: To ensure tests execute successfully on automated grading environments or offline machines without requiring paid API keys, the framework incorporates a semantic analyzer based on dream sentiment lexicons.
3. **Comparison & Assertion**: The test suite runs dynamically across all entries in `dreams-diary.html`, checking that:
   $$\text{AI}(\text{Dream Title}) = \text{Table Type}$$

---

## ⚡ Prerequisites

- **Node.js**: `v20.x` or higher (tested on Node v24)
- **npm**: `v10.x` or higher
- **Git**

---

## 🚀 Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/Shrinath0209/Automated-Testing-for-Dream-Portal.git
cd Automated-Testing-for-Dream-Portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install browser binaries
```bash
npx playwright install chromium
```

### 4. Configure environment (Optional)
```bash
cp .env.example .env
```
*(Optional) If you have an OpenAI key, populate `OPENAI_API_KEY=sk-...` in `.env`. If left blank, the suite runs seamlessly using the built-in semantic classifier.*

---

## 💻 Running Tests

### Run the entire test suite
```bash
npm test
```

### Run tests with interactive browser UI (Headed mode)
```bash
npm run test:headed
```

### Run tests in Playwright Interactive UI mode
```bash
npm run test:ui
```

### Run individual test suites
```bash
# Dream Portal (index.html)
npm run test:portal

# Dreams Diary (dreams-diary.html)
npm run test:diary

# Dreams Summary (dreams-total.html)
npm run test:summary

# Complete End-to-End User Journey
npm run test:e2e

# AI-Based Dream Classification Suite
npm run test:ai
```

---

## 📊 Test Reports & Artifacts

After running tests, generate and open the interactive HTML report:

```bash
npm run report
```

The report includes:
- Test execution time breakdown
- Step-by-step logs and DOM snapshots
- Captured full-page screenshots
- Video recordings and trace viewer for any failed executions

---

## 🔄 CI/CD Integration

This repository includes a preconfigured GitHub Actions workflow ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)):
- Automatically runs on every `push` and `pull_request` targeting `main`.
- Runs on Ubuntu headless environments.
- Automatically archives and publishes the Playwright HTML test report as a workflow artifact.

---

## 📝 Evaluation Checklist

| Assignment Requirement | Status | Implementation Details |
|---|:---:|---|
| **Loading animation (~3s)** | ✅ | Verified in [`01-dream-portal.spec.ts`](tests/01-dream-portal.spec.ts) |
| **Main content & button visibility** | ✅ | Verified in [`01-dream-portal.spec.ts`](tests/01-dream-portal.spec.ts) |
| **Multi-tab opening from "My Dreams"** | ✅ | Native event handling via `waitForEvent('page')` |
| **10 dream entries validation** | ✅ | Verified in [`02-dreams-diary.spec.ts`](tests/02-dreams-diary.spec.ts) |
| **Dream types only Good / Bad** | ✅ | Strict enum assertion in [`02-dreams-diary.spec.ts`](tests/02-dreams-diary.spec.ts) |
| **All 3 columns populated** | ✅ | Verified in [`02-dreams-diary.spec.ts`](tests/02-dreams-diary.spec.ts) |
| **Summary statistics verification** | ✅ | Good: 6, Bad: 4, Total: 10, Recurring: 2 in [`03-dreams-total.spec.ts`](tests/03-dreams-total.spec.ts) |
| **Recurring dreams calculation** | ✅ | Programmatic frequency calculation in [`dreamStatsCalculator.ts`](src/utils/dreamStatsCalculator.ts) |
| **AI-Based dream classification** | ✅ | Hybrid OpenAI + semantic classifier in [`aiClassifier.service.ts`](src/services/aiClassifier.service.ts) |
| **Page Object Model (POM)** | ✅ | Clean separation under `src/pages/` |
| **HTML / Allure reporting** | ✅ | Playwright HTML report configured |
| **GitHub Actions CI** | ✅ | Fully configured in `.github/workflows/playwright.yml` |

---

## 👤 Author

- **Candidate**: Shrinath
- **Repository**: [Shrinath0209/Automated-Testing-for-Dream-Portal](https://github.com/Shrinath0209/Automated-Testing-for-Dream-Portal)
- **Review Access Shared With**: `qawingify`
