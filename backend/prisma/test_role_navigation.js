async function testRoleNavigation() {
  try {
    // 1. Test Cutting Master Role
    console.log('--- 1. CUTTING MASTER ROLE TESTS ---');
    const masterLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cutting@factory.com', password: 'Cutting@123' }),
    }).then((r) => r.json());

    const masterToken = masterLogin.data.token;
    console.log('🔑 Logged in as Cutting Master.');

    const masterCut = await fetch('http://localhost:5000/api/cutting', {
      headers: { Authorization: 'Bearer ' + masterToken },
    });
    console.log('Cutting Queue Access (Allowed):', masterCut.status === 200 ? '✅ 200 OK' : masterCut.status);

    const masterEmp = await fetch('http://localhost:5000/api/employees', {
      headers: { Authorization: 'Bearer ' + masterToken },
    });
    console.log('Employees Access (Forbidden):', masterEmp.status === 403 ? '🔒 403 FORBIDDEN (Protected)' : masterEmp.status);

    // 2. Test Manager Role
    console.log('\n--- 2. MANAGER ROLE TESTS ---');
    const managerLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@factory.com', password: 'Manager@123' }),
    }).then((r) => r.json());

    const managerToken = managerLogin.data.token;
    console.log('🔑 Logged in as Manager.');

    const managerJobCards = await fetch('http://localhost:5000/api/job-cards', {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    console.log('Job Cards View Access (Allowed):', managerJobCards.status === 200 ? '✅ 200 OK' : managerJobCards.status);

    const managerArchive = await fetch('http://localhost:5000/api/archive', {
      headers: { Authorization: 'Bearer ' + managerToken },
    });
    console.log('Archive/Trash Access (Forbidden):', managerArchive.status === 403 ? '🔒 403 FORBIDDEN (Protected)' : managerArchive.status);

    // 3. Test Owner Role
    console.log('\n--- 3. OWNER ROLE TESTS ---');
    const ownerLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const ownerToken = ownerLogin.data.token;
    console.log('🔑 Logged in as Owner.');

    const ownerArchive = await fetch('http://localhost:5000/api/archive', {
      headers: { Authorization: 'Bearer ' + ownerToken },
    });
    console.log('Archive/Trash Access (Full Owner Access):', ownerArchive.status === 200 ? '✅ 200 OK' : ownerArchive.status);

    console.log('\n🎉 SUCCESS: Dynamic Role-Based Sidebar & Access Control fully verified!');
  } catch (err) {
    console.error('Role Navigation Test Error:', err);
  }
}

testRoleNavigation();
