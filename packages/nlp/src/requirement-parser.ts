import { Requirement } from './types';

export class RequirementParser {
  parseFromMarkdown(content: string): Requirement[] {
    const lines = content.split('\n');
    const requirements: Requirement[] = [];
    let currentSection = '';
    let requirementCounter = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and headers
      if (!trimmedLine || this.isHeader(trimmedLine)) {
        if (this.isHeader(trimmedLine)) {
          currentSection = this.extractHeaderText(trimmedLine);
        }
        continue;
      }

      // Check if line looks like a requirement
      if (this.isRequirementLine(trimmedLine)) {
        const requirement = this.parseRequirementLine(trimmedLine, requirementCounter, currentSection);
        if (requirement) {
          requirements.push(requirement);
          requirementCounter++;
        }
      }
    }

    return requirements;
  }

  private isHeader(line: string): boolean {
    return line.startsWith('#') || !!line.match(/^=+$/) || !!line.match(/^-+$/);
  }

  private extractHeaderText(line: string): string {
    if (line.startsWith('#')) {
      return line.replace(/^#+\s*/, '').trim();
    }
    return '';
  }

  private isRequirementLine(line: string): boolean {
    // Detect bullet points, numbered lists, or lines with modal verbs
    const patterns = [
      /^[-*+]\s+/,           // Bullet points
      /^\d+\.\s+/,           // Numbered lists
      /\b(must|should|shall|will|can|may)\b/i,  // Modal verbs
      /^The system/i,        // Common requirement starters
      /^Users?\s+(must|should|shall|will|can)/i,
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private parseRequirementLine(line: string, counter: number, section: string): Requirement | null {
    // Clean up the line
    let text = line.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '').trim();
    
    if (!text) return null;

    // Determine priority based on modal verbs
    const priority = this.extractPriority(text);
    const type = this.determineType(text);

    return {
      id: `REQ-${counter.toString().padStart(3, '0')}`,
      text,
      type,
      priority,
      category: section || 'General'
    };
  }

  private extractPriority(text: string): 'must' | 'should' | 'could' | 'wont' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('must') || lowerText.includes('shall') || lowerText.includes('required')) {
      return 'must';
    }
    if (lowerText.includes('should') || lowerText.includes('will')) {
      return 'should';
    }
    if (lowerText.includes('could') || lowerText.includes('may') || lowerText.includes('might')) {
      return 'could';
    }
    
    // Default to 'should' for standard requirements
    return 'should';
  }

  private determineType(text: string): 'functional' | 'non-functional' | 'business-rule' {
    const lowerText = text.toLowerCase();
    
    // Non-functional indicators
    const nonFunctionalKeywords = [
      'performance', 'security', 'usability', 'reliability', 'scalability',
      'response time', 'load', 'concurrent', 'availability', 'backup'
    ];
    
    // Business rule indicators
    const businessRuleKeywords = [
      'rule', 'policy', 'regulation', 'compliance', 'approval', 'validation',
      'business logic', 'constraint', 'condition'
    ];
    
    if (nonFunctionalKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'non-functional';
    }
    
    if (businessRuleKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'business-rule';
    }
    
    return 'functional';
  }
}
