async function testP014Revised() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Update Dynamic Settings in Settings Engine
    await fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        settings: {
          default_priority: 'URGENT',
          default_stitching_rate: '135.0',
          default_due_days: '10',
        },
      }),
    });

    console.log('⚙️ Updated Settings: default_priority=URGENT, default_stitching_rate=135.0, default_due_days=10');

    // 2. Create Job Card without priority, stitching_rate or due_date (Engine will auto-apply defaults!)
    const randomJC = `JC-${Math.floor(10000 + Math.random() * 90000)}`;
    const jcRes = await fetch('http://localhost:5000/api/job-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        job_card_number: randomJC,
        design_code: 'DES-DYN-99',
        components: ['Top', 'Pant'],
        items: [{ color: 'Green', size: 'M', quantity: 40 }],
      }),
    }).then((r) => r.json());

    if (!jcRes.success) {
      console.log('Job Card Creation Response:', jcRes);
      return;
    }

    const createdJC = jcRes.data.jobCard;
    console.log('\n✨ Dynamically Configured Job Card Created:');
    console.log({
      job_card_number: createdJC.job_card_number,
      priority: createdJC.priority, // Expect URGENT
      stitching_rate: createdJC.stitching_rate, // Expect 135.0
      due_date: createdJC.due_date,
    });

    if (createdJC.priority === 'URGENT' && createdJC.stitching_rate === 135) {
      console.log('\n🎉 SUCCESS: The Settings module is now a Dynamic Configuration Engine powering the ERP!');
    } else {
      console.error('\n❌ Config Engine did not auto-apply dynamic settings correctly.');
    }
  } catch (err) {
    console.error('P-014 Revision Test Error:', err);
  }
}

testP014Revised();
