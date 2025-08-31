#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { createAIClient, TestDataSchema, TestData } from '../packages/ai-core/src';

// Load environment variables
dotenv.config();

const OUTPUT_PATH = path.join(__dirname, '../apps/e2e/fixtures/testdata.json');

async function generateTestData(): Promise<void> {
  console.log('🧪 Generating test data...');
  
  const aiClient = createAIClient();
  const domain = process.env.TESTDATA_DOMAIN || 'e-commerce';
  
  const prompt = buildTestDataPrompt(domain);
  
  try {
    console.log(`📝 Using AI provider: ${process.env.AI_PROVIDER || 'none'}`);
    
    const response = await aiClient.call({
      system: 'You are a test data generator. Create realistic, diverse test data that includes edge cases and internationalization examples.',
      prompt,
      json: true,
      temperature: 0.7
    });

    // Parse and validate with Zod
    const rawData = JSON.parse(response.content);
    const validatedData = TestDataSchema.parse(rawData);
    
    // Write to file
    ensureDirectoryExists(path.dirname(OUTPUT_PATH));
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(validatedData, null, 2));
    
    console.log('✅ Test data generated successfully!');
    console.log(`📁 Output: ${OUTPUT_PATH}`);
    console.log(`📊 Generated: ${validatedData.users.length} users, ${validatedData.addresses.length} addresses`);
    console.log(`🚫 Negative cases: ${validatedData.negative.emails.length} invalid emails, ${validatedData.negative.passwords.length} invalid passwords`);
    
  } catch (error) {
    console.error('❌ Test data generation failed:', error);
    
    if (error instanceof Error && error.message.includes('parse')) {
      console.log('🔄 JSON validation failed, generating fallback data...');
      const fallbackData = generateFallbackTestData();
      
      // Validate fallback data
      const validatedFallback = TestDataSchema.parse(fallbackData);
      
      ensureDirectoryExists(path.dirname(OUTPUT_PATH));
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(validatedFallback, null, 2));
      
      console.log('✅ Fallback test data generated successfully!');
      console.log(`📁 Output: ${OUTPUT_PATH}`);
    } else {
      process.exit(1);
    }
  }
}

function buildTestDataPrompt(domain: string): string {
  return `Generate comprehensive test data for ${domain} application testing.

Requirements:
1. Create diverse, realistic users with international names (including Unicode characters)
2. Include various address formats from different countries
3. Generate negative test cases for validation testing
4. Include edge cases like empty strings, special characters, very long strings
5. Use realistic but fictional data

Please generate JSON in this exact structure:
{
  "users": [
    {
      "firstName": "string",
      "lastName": "string", 
      "email": "valid@email.com",
      "password": "string with 6+ chars"
    }
  ],
  "addresses": [
    {
      "line1": "street address",
      "city": "city name",
      "postalCode": "postal/zip code",
      "country": "country name"
    }
  ],
  "negative": {
    "emails": ["array of invalid email formats"],
    "passwords": ["array of invalid passwords"]
  }
}

Generate at least 5 users and 3 addresses. Include names with diacritics, emoji, and various scripts. Make negative cases comprehensive for testing validation logic.`;
}

function generateFallbackTestData(): TestData {
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
        firstName: "张",
        lastName: "伟",
        email: "zhang.wei@example.cn",
        password: "密码123456"
      },
      {
        firstName: "Émilie",
        lastName: "Dubois",
        email: "emilie.dubois@example.fr",
        password: "MotDePasse123!"
      },
      {
        firstName: "Test🌟User",
        lastName: "Unicode™",
        email: "test.emoji@example.com",
        password: "Emoji🔒Password123"
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

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Run the script
if (require.main === module) {
  generateTestData().catch(console.error);
}
