async function testP009() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // Fetch existing employee or create
    const empList = await fetch('http://localhost:5000/api/employees', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    let emp = empList.data.employees[0];

    if (!emp) {
      const empRes = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          employee_code: 'EMP-0001',
          employee_name: 'Ramesh Patel',
          phone: '9876543210',
          status: 'ACTIVE',
        }),
      }).then((r) => r.json());
      emp = empRes.data.employee;
    }

    console.log('👤 Employee:', emp.employee_name, '| ID:', emp.id);

    // Issue Advance Loan
    const advRes = await fetch(`http://localhost:5000/api/employees/${emp.id}/advances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ amount: 500, reason: 'Festival advance' }),
    }).then((r) => r.json());
    console.log('💵 Advance Response:', advRes.message);

    // Issue Salary Payment
    const pmtRes = await fetch(`http://localhost:5000/api/employees/${emp.id}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ amount: 2000, payment_mode: 'CASH', reference_no: 'REF-101' }),
    }).then((r) => r.json());
    console.log('💰 Payment Response:', pmtRes.message);

    // Get 360 Workspace
    const wsRes = await fetch(`http://localhost:5000/api/employees/${emp.id}/workspace`, {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n📊 360 Employee Workspace Summary:');
    console.log(JSON.stringify(wsRes.data.summary, null, 2));
    console.log(`\n🕒 Timeline Activity Log Count: ${wsRes.data.timeline.length}`);
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testP009();
