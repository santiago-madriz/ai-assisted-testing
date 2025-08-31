#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { RequirementParser, TestCaseGenerator } from '../packages/nlp/src';

// Load environment variables
dotenv.config();

const REQUIREMENTS_PATH = path.join(__dirname, '../data/requirements.md');
const OUTPUT_JSON_PATH = path.join(__dirname, '../apps/e2e/tests/testcases.json');
const OUTPUT_SPEC_PATH = path.join(__dirname, '../apps/e2e/tests/generated.spec.ts');

async function generateTestCases(): Promise<void> {
  console.log('🧠 Generating test cases from requirements...');
  
  try {
    // Read requirements
    if (!fs.existsSync(REQUIREMENTS_PATH)) {
      throw new Error(`Requirements file not found: ${REQUIREMENTS_PATH}`);
    }
    
    const requirementsContent = fs.readFileSync(REQUIREMENTS_PATH, 'utf-8');
    console.log(`📖 Reading requirements from: ${REQUIREMENTS_PATH}`);
    
    // Parse requirements
    const parser = new RequirementParser();
    const requirements = parser.parseFromMarkdown(requirementsContent);
    console.log(`📋 Parsed ${requirements.length} requirements`);
    
    // Generate test cases
    const generator = new TestCaseGenerator();
    
    console.log(`🤖 Using AI provider: ${process.env.AI_PROVIDER || 'none'}`);
    const testSuite = await generator.generateWithAI(requirements);
    
    // Write JSON output
    ensureDirectoryExists(path.dirname(OUTPUT_JSON_PATH));
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(testSuite, null, 2));
    console.log(`📁 Test cases JSON: ${OUTPUT_JSON_PATH}`);
    
    // Generate Playwright spec
    const specContent = generatePlaywrightSpec(testSuite);
    fs.writeFileSync(OUTPUT_SPEC_PATH, specContent);
    console.log(`📁 Playwright spec: ${OUTPUT_SPEC_PATH}`);
    
    console.log('✅ Test case generation completed successfully!');
    console.log(`📊 Generated ${testSuite.cases.length} test cases`);
    
    // Print summary
    const casesByType = testSuite.cases.reduce((acc, testCase) => {
      acc[testCase.type] = (acc[testCase.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Test case breakdown:');
    Object.entries(casesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Test case generation failed:', error);
    process.exit(1);
  }
}

function generatePlaywrightSpec(testSuite: any): string {
  return `// Auto-generated test file - DO NOT EDIT MANUALLY
// Generated from requirements at: ${new Date().toISOString()}

import { test, expect } from '@playwright/test';
import testCases from './testcases.json';

test.describe('${testSuite.suite}', () => {
  ${testSuite.cases.map((testCase: any) => `
  test('${testCase.title}', async ({ page }) => {
    // Test ID: ${testCase.id}
    // Type: ${testCase.type}
    // Priority: ${testCase.priority}
    // Tags: ${testCase.tags.join(', ')}
    
    ${generateTestSteps(testCase)}
  });`).join('\n')}
});

// Helper functions for test execution
async function loginWithValidCredentials(page: any) {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
}

async function loginWithInvalidCredentials(page: any) {
  await page.goto('/');
  await page.getByTestId('username').fill('invalid_user');
  await page.getByTestId('password').fill('invalid_password');
  await page.getByTestId('login-button').click();
}

async function navigateToInventory(page: any) {
  await page.goto('/inventory.html');
}

async function addItemToCart(page: any, itemName = 'Sauce Labs Backpack') {
  await page.getByText(itemName).locator('..').locator('[data-test*="add-to-cart"]').click();
}
`;
}

function generateTestSteps(testCase: any): string {
  const title = testCase.title.toLowerCase();
  const type = testCase.type;
  
  // Login test cases
  if (title.includes('login')) {
    if (type === 'positive') {
      return `
    await loginWithValidCredentials(page);
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByTestId('shopping_cart_container')).toBeVisible();`;
    } else {
      return `
    await loginWithInvalidCredentials(page);
    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page.getByTestId('error')).toContainText('Username and password do not match');`;
    }
  }
  
  // Shopping cart test cases
  if (title.includes('cart') || title.includes('add')) {
    return `
    await loginWithValidCredentials(page);
    await navigateToInventory(page);
    await addItemToCart(page);
    await expect(page.getByTestId('shopping_cart_badge')).toContainText('1');`;
  }
  
  // Navigation test cases
  if (title.includes('navigate') || title.includes('browse')) {
    return `
    await loginWithValidCredentials(page);
    await navigateToInventory(page);
    await expect(page.getByTestId('inventory_container')).toBeVisible();
    await expect(page.locator('.inventory_item')).toHaveCountGreaterThan(0);`;
  }
  
  // Generic test case
  return `
    // TODO: Implement test steps for: ${testCase.title}
    // Steps: ${testCase.steps.map((step: string) => `
    //   - ${step}`).join('')}
    // Expected: ${testCase.expected}
    
    await page.goto('/');
    // Add your test implementation here
    await expect(page).toHaveTitle(/Swag Labs/);`;
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Run the script
if (require.main === module) {
  generateTestCases().catch(console.error);
}
