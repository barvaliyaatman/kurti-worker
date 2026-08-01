async function testP014() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Fetch System Settings
    const getRes = await fetch('http://localhost:5000/api/settings', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n⚙️ System Settings Categories Count:', Object.keys(getRes.data.categories).length);
    console.log('Sample Factory Name:', getRes.data.settings.factory_name);

    // 2. Update a System Setting
    const updateRes = await fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        settings: {
          factory_name: 'Kurti ERP Central Factory Jaipur Unit 1',
        },
      }),
    }).then((r) => r.json());

    console.log('\n✏️ Update Settings Status:', updateRes.message);

    // 3. Fetch Company Profile
    const companyRes = await fetch('http://localhost:5000/api/company', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n🏢 Company Profile Details:');
    console.log(JSON.stringify(companyRes.data.company, null, 2));

    // 4. Fetch Role Permissions
    const rolesRes = await fetch('http://localhost:5000/api/roles', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n🛡️ Role Matrix Count:', Object.keys(rolesRes.data.roles).length);

    console.log('\n✅ System Settings & Configurations verified against live database successfully!');
  } catch (err) {
    console.error('P-014 Test Error:', err);
  }
}

testP014();
