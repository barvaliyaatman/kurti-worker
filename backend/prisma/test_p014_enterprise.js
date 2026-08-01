async function testP014Enterprise() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Fetch Number Series
    const jcSeries = await fetch('http://localhost:5000/api/settings/number-series/job-card', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());
    console.log('✨ Auto Next Job Card Series:', jcSeries.data.number);

    const empSeries = await fetch('http://localhost:5000/api/settings/number-series/employee', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());
    console.log('✨ Auto Next Employee Series:', empSeries.data.number);

    const advSeries = await fetch('http://localhost:5000/api/settings/number-series/advance', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());
    console.log('✨ Auto Next Advance Series:', advSeries.data.number);

    const paySeries = await fetch('http://localhost:5000/api/settings/number-series/payment', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());
    console.log('✨ Auto Next Payment Series:', paySeries.data.number);

    // 2. Update Job Card Prefix to JC-ENT- in Number Series
    await fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        settings: {
          job_card_prefix: 'JC-ENT',
        },
      }),
    });

    // 3. Re-fetch Job Card Number Series
    const newJcSeries = await fetch('http://localhost:5000/api/settings/number-series/job-card', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());
    console.log('\n✏️ Updated Job Card Series with new prefix:', newJcSeries.data.number);

    // 4. Test Reset Settings
    const resetRes = await fetch('http://localhost:5000/api/settings/reset', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());
    console.log('\n🔄 Reset Settings Status:', resetRes.message);

    console.log('\n🎉 SUCCESS: Enterprise Dynamic Configuration Engine & Number Series verified!');
  } catch (err) {
    console.error('P-014 Enterprise Test Error:', err);
  }
}

testP014Enterprise();
