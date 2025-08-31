# AI-Assisted Testing Framework

A comprehensive testing framework that demonstrates:
- 🤖 **AI-generated test data** with schema validation and safe fallbacks
- 📝 **NLP-powered test case generation** from requirements documents
- 🎯 **End-to-end automation** using Playwright with SauceDemo

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd ai-assisted-testing
npm install

# Set up environment (optional - works without AI keys)
cp .env.example .env
# Edit .env with your AI provider keys if desired

# Generate test data and cases
npm run gen:data
npm run gen:testcases

# Run tests
npm run test:e2e
```

## 📁 Project Structure

```
ai-assisted-testing/
├── apps/
│   └── e2e/                    # Playwright E2E tests
│       ├── fixtures/           # Generated test data
│       ├── tests/             # Test specifications
│       └── playwright.config.ts
├── packages/
│   ├── ai-core/               # AI provider abstraction
│   │   └── src/
│   │       ├── client.ts      # Main AI client
│   │       ├── schemas.ts     # Zod validation schemas
│   │       └── providers/     # OpenAI, Anthropic, fallback
│   └── nlp/                   # Requirements parsing & test generation
│       └── src/
│           ├── requirement-parser.ts
│           └── test-case-generator.ts
├── scripts/
│   ├── generate-testdata.ts   # AI-powered test data generation
│   └── generate-testcases.ts  # Requirements → test cases
├── data/
│   └── requirements.md        # Sample requirements
└── .github/workflows/         # CI/CD automation
```

## 🧪 What It Does

### 1. AI-Generated Test Data
- Creates realistic, diverse test data using AI or rule-based fallbacks
- Includes international characters, edge cases, and negative scenarios
- Schema validation with Zod ensures data quality
- Outputs to `apps/e2e/fixtures/testdata.json`

### 2. NLP Test Case Generation
- Parses requirements from Markdown documents
- Generates structured test cases using AI or heuristics
- Maps requirements to executable Playwright tests
- Outputs JSON and executable `.spec.ts` files

## 🛠️ How to Run

### With AI Providers (Optional)
```bash
# Set up your .env file
AI_PROVIDER=openai
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini

# Or use Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### Without AI (Fallback Mode)
```bash
# Works out of the box with rule-based generation
AI_PROVIDER=none  # or just leave blank

npm run gen:data      # Generates realistic fallback data
npm run gen:testcases # Uses heuristic-based test generation
npm run test:e2e      # Runs all tests
```

### Available Commands
```bash
npm run build              # TypeScript compilation
npm run gen:data           # Generate test data
npm run gen:testcases      # Generate test cases from requirements
npm run test:e2e           # Run Playwright tests
npm run test:e2e:ui        # Run tests with UI mode
npm run test:e2e:report    # Open test report
npm run format             # Format code
npm run format:check       # Check formatting
```

## 🔒 Security & Safety

### ✅ What We Do Right
- **No secrets in code**: All API keys from environment variables
- **Schema validation**: Zod validates all AI-generated JSON
- **Graceful fallbacks**: System works without AI providers
- **Deterministic CI**: Green builds even without API keys
- **Minimal prompts**: Focused, secure prompt engineering

### 🔍 Risk Mitigation
- JSON parsing errors trigger rule-based fallbacks
- Generated tests include safety checks and validations
- All external data validated before use
- Clear separation between AI and deterministic logic

## 🚀 CI/CD Pipeline

Our GitHub Actions workflow:
1. **Install** dependencies and setup environment
2. **Generate** test data using configured AI provider
3. **Create** test cases from requirements
4. **Execute** Playwright tests against SauceDemo
5. **Upload** reports and artifacts
6. **Comment** on PRs with test results

The pipeline works with or without AI provider credentials.
