// src/utils/createAdmin.ts
import dotenv from 'dotenv';
dotenv.config();

import * as readline from 'readline';
import connectDB from '../config/db';
import { UserService } from '../services/UserService';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Note: Password input will be visible in the terminal
// This is acceptable for a bootstrap script run locally
// For production environments, consider using environment variables or a more secure method

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password strength
const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

// Main function to create admin
const createAdmin = async () => {
  try {
    console.log('🔐 Create Admin User\n');
    console.log('This script will create a new admin user in the system.\n');

    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');

    const userService = new UserService();

    // Prompt for name
    let name = '';
    while (!name.trim()) {
      name = await question('Enter admin name: ');
      if (!name.trim()) {
        console.log('❌ Name cannot be empty. Please try again.\n');
      }
    }

    // Prompt for email
    let email = '';
    let emailValid = false;
    while (!emailValid) {
      email = await question('Enter admin email: ');
      email = email.trim().toLowerCase();

      if (!email) {
        console.log('❌ Email cannot be empty. Please try again.\n');
        continue;
      }

      if (!isValidEmail(email)) {
        console.log('❌ Invalid email format. Please try again.\n');
        continue;
      }

      // Check if email already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        console.log(`❌ User with email "${email}" already exists. Please use a different email.\n`);
        continue;
      }

      emailValid = true;
    }

    // Prompt for password
    // Note: Password will be visible in terminal (acceptable for bootstrap script)
    console.log('⚠️  Note: Password input will be visible in the terminal\n');
    let password = '';
    let passwordValid = false;
    while (!passwordValid) {
      password = await question('Enter admin password (min 8 chars, 1 uppercase, 1 lowercase, 1 number): ');
      
      const validation = validatePassword(password);
      if (!validation.valid) {
        console.log(`❌ ${validation.message}. Please try again.\n`);
        continue;
      }

      // Confirm password
      const confirmPassword = await question('Confirm password: ');
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match. Please try again.\n');
        continue;
      }

      passwordValid = true;
    }

    // Create admin user
    console.log('\nCreating admin user...');
    const adminUser = await userService.create({
      name: name.trim(),
      email: email,
      password: password,
      role: 'admin',
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 User Details:');
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser._id}`);
    console.log('\n💡 You can now use this account to login as an admin.\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    rl.close();
    process.exit(1);
  }
};

// Run the script if executed directly
if (require.main === module) {
  createAdmin();
}

export default createAdmin;

