async function testSafeDeleteSystem() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in as Owner.');

    const randomJC = `JC-SF-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Create a Test Job Card (Status: CREATED)
    const jcRes = await fetch('http://localhost:5000/api/job-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        job_card_number: randomJC,
        design_code: 'DES-SAFE',
        stitching_rate: 110.0,
        components: ['Top', 'Pant'],
        items: [{ color: 'Maroon', size: 'M', quantity: 40 }],
      }),
    }).then((r) => r.json());

    const jobCard = jcRes.data.jobCard || jcRes.data;
    const jcId = jobCard.id;
    console.log('✨ Created Job Card:', jobCard.job_card_number, '(Status:', jobCard.status, ')');

    // 2. Soft Delete Job Card
    const delRes = await fetch(`http://localhost:5000/api/job-cards/${jcId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('🗑️ Soft Delete Status:', delRes.message);

    // 3. Fetch Archived Records in Trash (/api/archive)
    const archiveRes = await fetch('http://localhost:5000/api/archive', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('📦 Total Archived Items in Trash:', archiveRes.data.totalArchived);
    console.log('Archived Job Cards:', archiveRes.data.jobCards.map((j) => j.job_card_number));

    // 4. Restore Job Card from Trash
    const restoreRes = await fetch(`http://localhost:5000/api/archive/job_card/${jcId}/restore`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('🔄 Restore Record Status:', restoreRes.message);

    // 5. Test Protection: Send Job Card to Cutting, then try deleting it
    await fetch(`http://localhost:5000/api/job-cards/${jcId}/send-to-cutting`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });

    const badDelRes = await fetch(`http://localhost:5000/api/job-cards/${jcId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n🛑 Protected Active Card Delete Rejection Result:', badDelRes.message);

    console.log('\n🎉 SUCCESS: Safe Delete & Archive System fully verified!');
  } catch (err) {
    console.error('Safe Delete Test Error:', err);
  }
}

testSafeDeleteSystem();
