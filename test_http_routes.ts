async function testHttpRoutes() {
  const routes = [
    '/',
    '/login',
    '/dashboard',
    '/documents',
    '/readiness',
    '/certifications',
    '/packaging',
    '/shipments',
    '/business',
    '/provider',
    '/admin',
  ];

  console.log('Testing HTTP response status for all primary routes on http://localhost:3000 ...\n');
  let allOk = true;

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`, {
        headers: {
          // Pass mock cookie for testing authenticated routes
          'Cookie': 'vyaparflow_user_id=mock_id; vyaparflow_persona=MSME; vyaparflow_user_email=exporter@vyaparflow.app',
        },
        redirect: 'manual',
      });
      console.log(`Route [${route}] -> Status: ${res.status} ${res.statusText}`);
      if (res.status >= 500) {
        console.error(`❌ Server Error on route ${route}`);
        allOk = false;
      }
    } catch (e: any) {
      console.error(`❌ Failed to fetch route ${route}:`, e.message);
      allOk = false;
    }
  }

  if (allOk) {
    console.log('\n✅ All routes responded cleanly without 500 server errors!');
  }
}

testHttpRoutes();
