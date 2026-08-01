async function testP011() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Fetch Advances Overview
    const advRes = await fetch('http://localhost:5000/api/advances', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n📊 Advances Dashboard Summary:');
    console.log(JSON.stringify(advRes.data.summary, null, 2));
    console.log(`- Advances Count: ${advRes.data.advances.length}`);

    // 2. Fetch Payments Overview
    const pmtRes = await fetch('http://localhost:5000/api/payments', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log(`\n💰 Salary Payments Log Count: ${pmtRes.data.payments.length}`);

    // 3. Fetch Payments Audit History
    const historyRes = await fetch('http://localhost:5000/api/payments/history', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log(`\n📜 Payment Audit History Count: ${historyRes.data.history.length}`);

    // 4. Fetch Advance & Payment Reports
    const reportsRes = await fetch('http://localhost:5000/api/payments/reports', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log(`\n📄 Reports data generated for ${reportsRes.data.report.length} workers.`);
  } catch (err) {
    console.error('P-011 Test Error:', err);
  }
}

testP011();
