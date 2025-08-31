import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse } from './types';

export class FallbackProvider extends BaseAIProvider {
  async call(request: AIRequest): Promise<AIResponse> {
    console.log('🤖 Using fallback provider (rule-based generation)');
    
    if (request.json) {
      return this.generateFallbackJSON(request);
    }
    
    return this.generateFallbackText(request);
  }

  private async generateFallbackJSON(request: AIRequest): Promise<AIResponse> {
    // Generate rule-based JSON based on common patterns
    let fallbackData: any = {};

    const prompt = request.prompt.toLowerCase();
    
    if (prompt.includes('test data') || prompt.includes('user') || prompt.includes('e-commerce')) {
      fallbackData = this.generateTestData();
    } else if (prompt.includes('test case') || prompt.includes('requirement')) {
      fallbackData = this.generateTestCases();
    } else {
      fallbackData = {
        message: "Fallback response generated using rule-based approach",
        timestamp: new Date().toISOString(),
        provider: "fallback"
      };
    }

    return {
      content: JSON.stringify(fallbackData, null, 2),
      provider: 'none',
      model: 'rule-based-fallback',
    };
  }

  private async generateFallbackText(request: AIRequest): Promise<AIResponse> {
    const content = `This is a fallback response generated using rule-based logic.
Original prompt: ${request.prompt}

Since no AI provider is configured, this response demonstrates that the system can operate without external AI services.`;

    return {
      content,
      provider: 'none',
      model: 'rule-based-fallback',
    };
  }

  private generateTestData() {
    return {
      users: [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!"
        },
        {
          firstName: "María",
          lastName: "García",
          email: "maria.garcia@example.es",
          password: "Contraseña123!"
        },
        {
          firstName: "Zhang",
          lastName: "Wei",
          email: "zhang.wei@example.cn",
          password: "Password123!"
        },
        {
          firstName: "Émilie",
          lastName: "Dubois",
          email: "emilie.dubois@example.fr",
          password: "MotDePasse123!"
        },
        {
          firstName: "TestUser",
          lastName: "Unicode",
          email: "test.emoji@example.com",
          password: "EmojiPassword123"
        }
      ],
      addresses: [
        {
          line1: "123 Main Street",
          city: "New York",
          postalCode: "10001",
          country: "United States"
        },
        {
          line1: "456 Elm Avenue",
          city: "Toronto",
          postalCode: "M5V 3A8",
          country: "Canada"
        },
        {
          line1: "789 König Straße",
          city: "Berlin",
          postalCode: "10115",
          country: "Germany"
        }
      ],
      negative: {
        emails: [
          "",
          "invalid-email",
          "@example.com",
          "missing@",
          "spaces in@email.com",
          "toolong" + "x".repeat(250) + "@example.com",
          "missing.domain@",
          "double@@example.com",
          "trailing.dot.@example.com"
        ],
        passwords: [
          "",
          "123",
          "weak",
          "   ",
          "short",
          "toolong" + "x".repeat(100),
          "no-numbers-or-special",
          "\t\n\r"
        ]
      }
    };
  }

  private generateTestCases() {
    return {
      suite: "E-commerce Login Tests",
      cases: [
        {
          id: "TC001",
          title: "Successful login with valid credentials",
          type: "positive",
          steps: [
            "Navigate to login page",
            "Enter valid username",
            "Enter valid password",
            "Click Login button"
          ],
          expected: "User should be redirected to dashboard",
          tags: ["login", "positive", "smoke"]
        },
        {
          id: "TC002",
          title: "Login fails with invalid credentials",
          type: "negative",
          steps: [
            "Navigate to login page",
            "Enter invalid username",
            "Enter invalid password",
            "Click Login button"
          ],
          expected: "Error message should be displayed",
          tags: ["login", "negative", "validation"]
        }
      ]
    };
  }
}
