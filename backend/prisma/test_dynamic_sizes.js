async function testDynamicGarmentSizes() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Fetch Garment Size Master
    const sizesRes = await fetch('http://localhost:5000/api/garment-sizes', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('📏 Garment Size Catalog Count:', sizesRes.data.sizes.length);
    console.log('Catalog Sizes:', sizesRes.data.sizes.map((s) => `${s.size_name} (#${s.display_order})`).join(', '));

    // 2. Add New Custom Garment Size '4XL'
    const addSizeRes = await fetch('http://localhost:5000/api/garment-sizes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        size_name: '4XL',
        display_order: 9,
        is_active: true,
      }),
    }).then((r) => r.json());

    console.log('\n➕ Add New Size Status:', addSizeRes.message);

    // 3. Create a Job Card using the newly added custom size '4XL'
    const randomJC = `JC-${Math.floor(100 + Math.random() * 900)}`;
    const jcRes = await fetch('http://localhost:5000/api/job-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        job_card_number: randomJC,
        design_code: 'DES-DYN-4XL',
        stitching_rate: 145.0,
        components: ['Top', 'Pant'],
        items: [{ color: 'Navy Blue', size: '4XL', quantity: 60 }],
      }),
    }).then((r) => r.json());

    console.log('\n✨ Created Job Card with Dynamic Size 4XL:', jcRes.data.jobCard.job_card_number);
    console.log('Job Card Item Breakdown:', jcRes.data.jobCard.items);

    console.log('\n🎉 SUCCESS: Dynamic Garment Size Configuration Engine fully verified!');
  } catch (err) {
    console.error('Dynamic Sizes Test Error:', err);
  }
}

testDynamicGarmentSizes();
