# AI-Assisted Testing Framework

[![CI](https://github.com/your-org/ai-assisted-testing/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/ai-assisted-testing/actions/workflows/ci.yml)

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

## 📊 Extending the Framework

### Adding New AI Providers
```typescript
// packages/ai-core/src/my-provider.ts
export class MyProvider extends BaseAIProvider {
  async call(request: AIRequest): Promise<AIResponse> {
    // Implement your provider logic
  }
}
```

### Custom Test Data Schemas
```typescript
// packages/ai-core/src/schemas.ts
export const CustomSchema = z.object({
  // Define your schema
});
```

### New Requirement Types
```typescript
// packages/nlp/src/requirement-parser.ts
private determineType(text: string): RequirementType {
  // Add your classification logic
}
```

## 🎯 Demo Scenarios

### E-commerce Test Coverage
- ✅ User authentication (valid/invalid credentials)
- ✅ Product browsing and search
- ✅ Shopping cart operations
- ✅ Checkout process end-to-end
- ✅ Error handling and validation

### Generated Test Data Examples
```json
{
  "users": [
    {
      "firstName": "María",
      "lastName": "García", 
      "email": "maria.garcia@example.es",
      "password": "Contraseña123!"
    }
  ],
  "negative": {
    "emails": ["invalid@", "@example.com", "spaces in@email.com"]
  }
}
```

## 📈 Quality Gates

Before considering the project complete:
- [ ] ✅ Builds from clean clone without errors
- [ ] ✅ Generates data with and without AI keys  
- [ ] ✅ Produces valid test cases and Playwright specs
- [ ] ✅ All tests pass in CI environment
- [ ] ✅ HTML reports generated and accessible
- [ ] ✅ No secrets committed to repository
- [ ] ✅ README instructions work for new users

## 🏗️ Architecture Decisions

### Why This Tech Stack?
- **TypeScript**: Type safety for AI-generated content
- **Playwright**: Modern, reliable E2E testing
- **Zod**: Runtime validation of generated data
- **Monorepo**: Clear separation of concerns
- **SauceDemo**: Reliable, public test target

### Provider Abstraction Benefits
- Swap AI providers without code changes
- Development works offline with fallbacks
- Cost control through provider selection
- Future-proof for new AI services

## 🔄 Development Workflow

### 2-Sprint Implementation Plan

**Sprint 1: Core Framework (5 days)**
- Monorepo setup with TypeScript/Playwright
- AI provider abstraction with OpenAI/Anthropic
- Test data generation with Zod validation
- Basic CI pipeline with artifact uploads

**Sprint 2: NLP & Polish (5 days)**  
- Requirements parser for Markdown
- Test case generator with AI refinement
- Playwright spec generation and mapping
- Documentation, examples, and final polish

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all quality gates pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the QA community**

*Demonstrating the future of AI-assisted test automation*
