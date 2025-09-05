#!/usr/bin/env node

/**
 * Test script to verify CORB fix
 * This script tests both direct API calls and proxy calls
 */

const axios = require('axios');

const API_BASE = 'http://localhost:8000/api/v1';
const CLIENT_BASE = 'http://localhost:5173/api/v1';

async function testEndpoint(baseUrl, endpoint, description) {
  try {
    console.log(`\n🧪 Testing ${description}: ${baseUrl}${endpoint}`);
    
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log(`✅ Success: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   CORS Headers: ${JSON.stringify({
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    })}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers: ${JSON.stringify(error.response.headers)}`);
    }
    return false;
  }
}

async function testCORBFix() {
  console.log('🚀 Testing CORB Fix Implementation\n');
  
  const endpoints = [
    '/health',
    '/destinations',
    '/auth/profile'
  ];
  
  let directApiSuccess = 0;
  let proxySuccess = 0;
  
  for (const endpoint of endpoints) {
    const directSuccess = await testEndpoint(API_BASE, endpoint, `Direct API${endpoint}`);
    const proxySuccess = await testEndpoint(CLIENT_BASE, endpoint, `Proxy${endpoint}`);
    
    if (directSuccess) directApiSuccess++;
    if (proxySuccess) proxySuccess++;
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   Direct API calls: ${directApiSuccess}/${endpoints.length} successful`);
  console.log(`   Proxy calls: ${proxySuccess}/${endpoints.length} successful`);
  
  if (proxySuccess === endpoints.length) {
    console.log('\n🎉 CORB fix appears to be working! Proxy is successfully routing requests.');
  } else {
    console.log('\n⚠️  Some issues detected. Check the server and client configurations.');
  }
}

// Run the test
testCORBFix().catch(console.error);