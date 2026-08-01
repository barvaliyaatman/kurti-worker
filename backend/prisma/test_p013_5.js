async function testP013_5() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@factory.com', password: 'Owner@123' }),
    }).then((r) => r.json());

    const token = loginRes.data.token;
    console.log('🔑 Logged in successfully.');

    // 1. Create a Job Card to trigger automatic notification
    const randomJC = `JC-${Math.floor(10000 + Math.random() * 90000)}`;
    await fetch('http://localhost:5000/api/job-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        job_card_number: randomJC,
        design_code: 'DES-NOTIF-01',
        components: ['Top', 'Pant'],
        stitching_rate: 125.0,
        priority: 'URGENT',
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        items: [
          { color: 'Red', size: 'M', quantity: 30 },
          { color: 'Blue', size: 'L', quantity: 20 },
        ],
      }),
    }).then((r) => r.json());

    console.log(`\n✨ Created Job Card ${randomJC} (Triggered automatic notification!)`);

    // 2. Fetch Unread Notifications Count
    const unreadRes = await fetch('http://localhost:5000/api/notifications/unread', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log(`\n🔔 Unread Notification Count: ${unreadRes.data.unread_count}`);

    // 3. Fetch Notifications Feed
    const listRes = await fetch('http://localhost:5000/api/notifications', {
      headers: { Authorization: 'Bearer ' + token },
    }).then((r) => r.json());

    console.log(`\n📜 Notifications Feed Count: ${listRes.data.notifications.length}`);
    if (listRes.data.notifications.length > 0) {
      console.log('Latest Notification:', {
        title: listRes.data.notifications[0].title,
        message: listRes.data.notifications[0].message,
        priority: listRes.data.notifications[0].priority,
      });
    }

    // 4. Mark all as read
    await fetch('http://localhost:5000/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    console.log('\n✅ Marked all notifications as read!');
  } catch (err) {
    console.error('P-013.5 Test Error:', err);
  }
}

testP013_5();
