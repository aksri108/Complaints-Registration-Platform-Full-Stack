// built-in fetch
const BASE_URL = 'http://localhost:3000/api';

async function testFullFlow() {
  try {
    // 1. Send OTP
    console.log('Sending OTP...');
    const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
    });
    const otpData = await otpRes.json();
    console.log('OTP Result:', otpData);

    // Since I can't check email, I'll assume the OTP is in the DB.
    // I'll skip the actual registration for now or just check if the AI question works.
    
    // 2. Get AI Question (Requires auth usually, but let's check)
    // Wait, the route /ai/question has authenticateToken.
    // I'll try to call it without auth to see it fail, then I'll know it's reachable.
    console.log('Testing AI question (should be 401)...');
    const aiRes = await fetch(`${BASE_URL}/complaints/ai/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaint_text: 'My internet is slow' })
    });
    console.log('AI status:', aiRes.status);
    
    process.exit(0);
  } catch (err) {
    console.error('Flow test failed:', err.message);
    process.exit(1);
  }
}

testFullFlow();
