async function testP010() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Get Payroll Dashboard
    const dashRes = await fetch('http://localhost:5000/api/salary', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log('\n📊 Payroll Dashboard Summary:');
    console.log(JSON.stringify(dashRes.data.summary, null, 2));

    if (dashRes.data.payroll.length > 0) {
      const firstWorker = dashRes.data.payroll[0];
      console.log(`\n👤 First Worker: ${firstWorker.employee_name} (${firstWorker.employee_code})`);
      console.log(`- Completed Pieces: ${firstWorker.completed_pieces}`);
      console.log(`- Gross Salary: ₹${firstWorker.gross_salary}`);
      console.log(`- Advances: ₹${firstWorker.advance}`);
      console.log(`- Net Salary: ₹${firstWorker.net_salary}`);
      console.log(`- Paid: ₹${firstWorker.paid}`);
      console.log(`- Pending: ₹${firstWorker.pending}`);
      console.log(`- Status: ${firstWorker.payment_status}`);

      // 2. Disburse partial payment
      if (firstWorker.pending > 0) {
        const payRes = await fetch('http://localhost:5000/api/salary/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            employee_id: firstWorker.employee_id,
            amount: Math.min(1000, firstWorker.pending),
            payment_mode: 'UPI',
            reference_no: 'PAY-1002',
            remarks: 'Partial salary payment',
          }),
        }).then((r) => r.json());
        console.log('\n💰 Disburse Payment Response:', payRes.message);
      }

      // 3. Get Worker Detailed Salary Workspace
      const detailsRes = await fetch(`http://localhost:5000/api/salary/${firstWorker.employee_id}`, {
        headers: { Authorization: 'Bearer ' + token },
      }).then((r) => r.json());

      console.log('\n📁 Worker Salary Details Workspace:');
      console.log(`- Completed Bundles Count: ${detailsRes.data.completed_bundles.length}`);
      console.log(`- Advances Count: ${detailsRes.data.advances.length}`);
      console.log(`- Payments Count: ${detailsRes.data.payments.length}`);
    }

    // 4. Get Payroll Reports
    const reportsRes = await fetch('http://localhost:5000/api/salary/reports', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log(`\n📄 Payroll Summary Report generated for ${reportsRes.data.report.length} workers.`);
  } catch (err) {
    console.error('P-010 Test Error:', err);
  }
}

testP010();
