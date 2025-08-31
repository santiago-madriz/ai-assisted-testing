export interface TestCase {
  id: string;
  title: string;
  type: 'positive' | 'negative' | 'api' | 'ui';
  steps: string[];
  expected: string;
  tags: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface TestSuite {
  suite: string;
  description?: string;
  cases: TestCase[];
}

export interface Requirement {
  id: string;
  text: string;
  type: 'functional' | 'non-functional' | 'business-rule';
  priority: 'must' | 'should' | 'could' | 'wont';
  category?: string;
}
