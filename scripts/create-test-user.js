#!/usr/bin/env node
/**
 * This script creates a test user in Supabase for development purposes.
 * Usage: node scripts/create-test-user.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check if required environment variables are present
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Required environment variables are missing.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create a Supabase client with the service role key (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test user credentials - change these as needed
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';
const TEST_USER_NAME = 'Test User';

async function createTestUser() {
  console.log(`Creating test user: ${TEST_USER_EMAIL}...`);

  try {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true, // Auto-confirm email so no verification is needed
      user_metadata: {
        full_name: TEST_USER_NAME
      }
    });

    if (authError) {
      console.error('Error creating test user in auth:', authError.message);
      
      // Check if user already exists - we can try to reset their password
      if (authError.message.includes('already registered')) {
        console.log('User already exists, attempting to reset password...');
        
        // Find user by email
        const { data: users, error: getUserError } = await supabase.auth.admin.listUsers();
        
        if (getUserError) {
          console.error('Error listing users:', getUserError.message);
          return;
        }
        
        const existingUser = users.users.find(user => user.email === TEST_USER_EMAIL);
        
        if (existingUser) {
          // Update user with new password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: TEST_USER_PASSWORD, email_confirm: true }
          );
          
          if (updateError) {
            console.error('Error updating existing user:', updateError.message);
            return;
          }
          
          console.log(`Updated existing user ${TEST_USER_EMAIL} with new password`);
          
          // Create or update profile
          await ensureUserProfile(existingUser.id);
          return;
        } else {
          console.error('Could not find user by email');
          return;
        }
      }
      
      return;
    }

    console.log('Successfully created user in Supabase Auth');
    console.log('User ID:', authData.user.id);
    
    // 2. Create a profile for this user
    await ensureUserProfile(authData.user.id);
    
    console.log('\nTest user created successfully!');
    console.log('-----------------------------');
    console.log('Email:', TEST_USER_EMAIL);
    console.log('Password:', TEST_USER_PASSWORD);
    console.log('-----------------------------');
    console.log('You can now log in with these credentials.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function ensureUserProfile(userId) {
  // Check if profile already exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileCheckError) {
    console.error('Error checking for existing profile:', profileCheckError.message);
    return;
  }
  
  if (existingProfile) {
    console.log('User profile already exists, updating...');
    
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: TEST_USER_NAME,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating profile:', updateError.message);
      return;
    }
    
    console.log('Profile updated successfully');
    return;
  }
  
  // Create new profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: TEST_USER_EMAIL,
      name: TEST_USER_NAME,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_admin: false
    });
    
  if (profileError) {
    console.error('Error creating user profile:', profileError.message);
    return;
  }
  
  console.log('Successfully created user profile');
}

// Run the function
createTestUser(); 