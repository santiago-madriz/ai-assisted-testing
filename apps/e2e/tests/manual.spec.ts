import { test, expect } from '@playwright/test';

test.describe('SauceDemo Manual Tests', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Verify we're on the login page
    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(page.getByTestId('login_logo')).toBeVisible();
    
    // Fill in credentials
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    
    // Login
    await page.getByTestId('login-button').click();
    
    // Verify successful login
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByTestId('shopping_cart_container')).toBeVisible();
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Fill in invalid credentials
    await page.getByTestId('username').fill('invalid_user');
    await page.getByTestId('password').fill('invalid_password');
    
    // Attempt login
    await page.getByTestId('login-button').click();
    
    // Verify error message
    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page.getByTestId('error')).toContainText('Username and password do not match');
  });

  test('should add item to cart', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    
    // Add item to cart
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    
    // Verify cart badge shows 1 item
    await expect(page.getByTestId('shopping_cart_badge')).toContainText('1');
    
    // Go to cart and verify item is there
    await page.getByTestId('shopping_cart_container').click();
    await expect(page).toHaveURL(/cart/);
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('should complete checkout process', async ({ page }) => {
    // Login and add item
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    
    // Go to cart
    await page.getByTestId('shopping_cart_container').click();
    await page.getByTestId('checkout').click();
    
    // Fill checkout information
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    
    // Complete order
    await expect(page.getByText('Checkout: Overview')).toBeVisible();
    await page.getByTestId('finish').click();
    
    // Verify completion
    await expect(page.getByText('Thank you for your order!')).toBeVisible();
    await expect(page.getByTestId('complete-header')).toContainText('Thank you for your order!');
  });
});
