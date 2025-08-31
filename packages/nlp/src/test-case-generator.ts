import { TestCase, TestSuite, Requirement } from './types';
import { createAIClient } from '../../ai-core/src';

export class TestCaseGenerator {
  generateFromRequirements(requirements: Requirement[]): TestSuite {
    const cases: TestCase[] = [];
    
    for (const requirement of requirements) {
      const generatedCases = this.generateCasesForRequirement(requirement);
      cases.push(...generatedCases);
    }

    return {
      suite: 'Generated Test Suite',
      description: `Test cases generated from ${requirements.length} requirements`,
      cases
    };
  }

  async generateWithAI(requirements: Requirement[]): Promise<TestSuite> {
    const aiClient = createAIClient();
    
    const prompt = this.buildPrompt(requirements);
    
    try {
      const response = await aiClient.call({
        system: 'You are a QA engineer who creates comprehensive test cases from requirements. Generate practical, executable test cases in the exact JSON format requested.',
        prompt,
        json: true,
        temperature: 0.3
      });

      const parsed = JSON.parse(response.content);
      
      // Check if this is the fallback AI response structure
      if (parsed.suite && Array.isArray(parsed.cases)) {
        return this.validateAndNormalizeTestSuite(parsed);
      } else {
        // If not the expected structure, fall back to rule-based generation
        console.warn('AI response not in expected format, using rule-based generation');
        return this.generateFromRequirements(requirements);
      }
    } catch (error) {
      console.warn('AI generation failed, falling back to rule-based generation:', error);
      return this.generateFromRequirements(requirements);
    }
  }

  private generateCasesForRequirement(requirement: Requirement): TestCase[] {
    const cases: TestCase[] = [];
    const baseId = requirement.id.replace('REQ-', 'TC-');
    
    // Generate positive test case
    const positiveCase = this.generatePositiveCase(requirement, `${baseId}-P`);
    cases.push(positiveCase);
    
    // Generate negative test case for must/should requirements
    if (requirement.priority === 'must' || requirement.priority === 'should') {
      const negativeCase = this.generateNegativeCase(requirement, `${baseId}-N`);
      cases.push(negativeCase);
    }
    
    return cases;
  }

  private generatePositiveCase(requirement: Requirement, id: string): TestCase {
    const steps = this.generateStepsFromRequirement(requirement, 'positive');
    
    return {
      id,
      title: `Verify ${requirement.text.toLowerCase()}`,
      type: this.determineTestType(requirement),
      steps,
      expected: this.generateExpectedResult(requirement, 'positive'),
      tags: this.generateTags(requirement, 'positive'),
      priority: this.mapPriorityToTestPriority(requirement.priority)
    };
  }

  private generateNegativeCase(requirement: Requirement, id: string): TestCase {
    const steps = this.generateStepsFromRequirement(requirement, 'negative');
    
    return {
      id,
      title: `Verify system handles invalid ${requirement.text.toLowerCase()}`,
      type: 'negative',
      steps,
      expected: this.generateExpectedResult(requirement, 'negative'),
      tags: this.generateTags(requirement, 'negative'),
      priority: this.mapPriorityToTestPriority(requirement.priority)
    };
  }

  private generateStepsFromRequirement(requirement: Requirement, type: 'positive' | 'negative'): string[] {
    const text = requirement.text.toLowerCase();
    
    // Login-related requirements
    if (text.includes('login') || text.includes('authenticate')) {
      return type === 'positive' 
        ? [
            'Navigate to login page',
            'Enter valid username',
            'Enter valid password',
            'Click Login button'
          ]
        : [
            'Navigate to login page',
            'Enter invalid credentials',
            'Click Login button',
            'Verify error message is displayed'
          ];
    }
    
    // Navigation requirements
    if (text.includes('navigate') || text.includes('access')) {
      return type === 'positive'
        ? [
            'Navigate to the application',
            'Locate the required feature',
            'Click on the feature',
            'Verify feature is accessible'
          ]
        : [
            'Navigate to the application',
            'Attempt to access restricted feature',
            'Verify access is denied'
          ];
    }
    
    // Form/input requirements
    if (text.includes('form') || text.includes('input') || text.includes('enter')) {
      return type === 'positive'
        ? [
            'Navigate to the form',
            'Fill in required fields with valid data',
            'Submit the form',
            'Verify successful submission'
          ]
        : [
            'Navigate to the form',
            'Fill in fields with invalid data',
            'Attempt to submit the form',
            'Verify validation errors are shown'
          ];
    }
    
    // Generic steps
    return type === 'positive'
      ? [
          'Navigate to the relevant page',
          'Perform the required action',
          'Verify the expected behavior'
        ]
      : [
          'Navigate to the relevant page',
          'Perform invalid action',
          'Verify error handling'
        ];
  }

  private generateExpectedResult(requirement: Requirement, type: 'positive' | 'negative'): string {
    if (type === 'positive') {
      return `The system should ${requirement.text.toLowerCase()}`;
    } else {
      return `The system should handle the invalid input gracefully and display appropriate error messages`;
    }
  }

  private generateTags(requirement: Requirement, type: 'positive' | 'negative'): string[] {
    const tags: string[] = [type, requirement.type, requirement.priority];
    
    const text = requirement.text.toLowerCase();
    if (text.includes('login')) tags.push('login');
    if (text.includes('security')) tags.push('security');
    if (text.includes('api')) tags.push('api');
    if (text.includes('ui') || text.includes('interface')) tags.push('ui');
    if (requirement.category) tags.push(requirement.category.toLowerCase().replace(/\s+/g, '-'));
    
    return tags.filter((tag, index) => tags.indexOf(tag) === index); // Remove duplicates
  }

  private determineTestType(requirement: Requirement): 'positive' | 'negative' | 'api' | 'ui' {
    const text = requirement.text.toLowerCase();
    
    if (text.includes('api') || text.includes('endpoint') || text.includes('service')) {
      return 'api';
    }
    
    if (text.includes('ui') || text.includes('interface') || text.includes('display') || text.includes('click')) {
      return 'ui';
    }
    
    return 'positive';
  }

  private mapPriorityToTestPriority(reqPriority: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (reqPriority) {
      case 'must': return 'critical';
      case 'should': return 'high';
      case 'could': return 'medium';
      case 'wont': return 'low';
      default: return 'medium';
    }
  }

  private buildPrompt(requirements: Requirement[]): string {
    return `Generate comprehensive test cases for the following requirements:

${requirements.map((req, index) => `${index + 1}. ${req.text} (Priority: ${req.priority}, Type: ${req.type})`).join('\n')}

Generate a TestSuite with the following exact JSON structure:
{
  "suite": "string - name of the test suite",
  "description": "string - brief description",
  "cases": [
    {
      "id": "string - unique identifier like TC001",
      "title": "string - descriptive test case title",
      "type": "positive|negative|api|ui",
      "steps": ["array", "of", "step", "strings"],
      "expected": "string - expected result",
      "tags": ["array", "of", "tag", "strings"],
      "priority": "low|medium|high|critical"
    }
  ]
}

Generate both positive and negative test cases where appropriate. Make test cases practical and executable for an e-commerce application like SauceDemo.`;
  }

  private validateAndNormalizeTestSuite(data: any): TestSuite {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid test suite data');
    }

    const suite: TestSuite = {
      suite: data.suite || 'Generated Test Suite',
      description: data.description,
      cases: []
    };

    if (Array.isArray(data.cases)) {
      suite.cases = data.cases.map((caseData: any, index: number) => ({
        id: caseData.id || `TC${(index + 1).toString().padStart(3, '0')}`,
        title: caseData.title || 'Untitled test case',
        type: ['positive', 'negative', 'api', 'ui'].includes(caseData.type) ? caseData.type : 'positive',
        steps: Array.isArray(caseData.steps) ? caseData.steps : ['No steps defined'],
        expected: caseData.expected || 'No expected result defined',
        tags: Array.isArray(caseData.tags) ? caseData.tags : [],
        priority: ['low', 'medium', 'high', 'critical'].includes(caseData.priority) ? caseData.priority : 'medium'
      }));
    }

    return suite;
  }
}
