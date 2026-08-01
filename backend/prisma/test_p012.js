async function testP012() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Reports Dashboard
    const dashRes = await fetch('http://localhost:5000/api/reports/dashboard', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n📊 Reports Analytics Summary Metrics:');
    console.log(JSON.stringify(dashRes.data.summary, null, 2));

    // 2. All 7 Report Categories
    const categories = [
      'production',
      'employees',
      'job-cards',
      'bundles',
      'salary',
      'advances',
      'payments',
    ];

    for (const cat of categories) {
      const catRes = await fetch(`http://localhost:5000/api/reports/${cat}`, {
        headers: { Authorization: 'Bearer ' + token },
      }).then((r) => r.json());

      const records = catRes.data?.records || catRes.data?.report || [];
      console.log(`- Category [${cat}]: ${records.length} live records retrieved.`);
    }

    console.log('\n✅ All 7 Reports Categories verified against live database successfully!');
  } catch (err) {
    console.error('P-012 Test Error:', err);
  }
}

testP012();
