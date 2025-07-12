#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Calendar Assistant Environment Setup\n');

const questions = [
  {
    name: 'GOOGLE_CLIENT_ID',
    message: 'Enter your Google Client ID: ',
    required: true
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    message: 'Enter your Google Client Secret: ',
    required: true
  },
  {
    name: 'OPENAI_API_KEY',
    message: 'Enter your OpenAI API Key: ',
    required: true
  }
];

const envContent = {
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  OPENAI_API_KEY: '',
  SESSION_SECRET: crypto.randomBytes(32).toString('base64'),
  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:3001'
};

let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    // All questions answered, write the .env file
    const envString = Object.entries(envContent)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync('.env', envString);
    console.log('\n✅ Environment file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your Google OAuth redirect URI is set to: http://localhost:3001/auth/google/callback');
    console.log('2. Run: docker-compose -f docker-compose.dev.yml up --build');
    console.log('3. Open http://localhost:3000 in your browser');
    rl.close();
    return;
  }

  const question = questions[currentQuestion];
  rl.question(question.message, (answer) => {
    if (!answer.trim() && question.required) {
      console.log('❌ This field is required. Please try again.');
      askQuestion();
      return;
    }
    
    envContent[question.name] = answer.trim();
    currentQuestion++;
    askQuestion();
  });
}

askQuestion(); 