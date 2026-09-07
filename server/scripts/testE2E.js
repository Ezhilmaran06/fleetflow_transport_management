const http = require('http');

const API_PORT = 5000;
const CLIENT_PORT = 5173;

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runE2ETests() {
  console.log('🚀 Starting FleetFlow Production Acceptance & E2E Validation...\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failedCount++;
    }
  }

  try {
    // 1. Backend Health Check
    console.log('--- Phase 1: Service Connectivity ---');
    const health = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data?.data?.database === 'CONNECTED', 'Backend online and connected to local MongoDB');

    // 2. Frontend Server Check
    const frontend = await request({
      hostname: '127.0.0.1',
      port: CLIENT_PORT,
      path: '/',
      method: 'GET'
    });
    assert(frontend.status === 200 && frontend.raw.includes('FleetFlow'), 'Frontend Vite dev server online serving index.html');

    // 3. User & Company Registration
    console.log('\n--- Phase 2: Tenant & User Authentication ---');
    const testEmail = `admin_${Date.now()}@apexflow.com`;
    const regRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      companyName: 'Apex Express Logistics',
      firstName: 'Alex',
      lastName: 'Mercer',
      email: testEmail,
      password: 'Password123!'
    });
    assert(regRes.status === 201 && regRes.data?.data?.token, 'Tenant company registered and JWT issued');
    const token = regRes.data?.data?.token;

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Verify /api/auth/me
    const meRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: authHeaders
    });
    assert(meRes.status === 200 && meRes.data?.data?.role === 'ADMIN', 'Auth verification identifies Admin role');

    // 4. Fleet Management
    console.log('\n--- Phase 3: Fleet Management Lifecycle ---');
    const vehicleRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/vehicles',
      method: 'POST',
      headers: authHeaders
    }, {
      registrationNumber: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      make: 'Freightliner',
      model: 'Cascadia 126',
      year: 2024,
      type: 'HEAVY_TRUCK',
      capacityWeight: 24000,
      fuelType: 'DIESEL',
      currentOdometer: 12500
    });
    assert(vehicleRes.status === 201 && vehicleRes.data?.data?._id, 'Created heavy truck with valid telemetry');
    const vehicleId = vehicleRes.data.data._id;

    // Driver Onboarding
    const driverRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/drivers',
      method: 'POST',
      headers: authHeaders
    }, {
      firstName: 'Marcus',
      lastName: 'Vance',
      licenseNumber: `CDL-${Math.floor(100000 + Math.random() * 900000)}`,
      licenseClass: 'Class A CDL',
      phone: '+1 555-0199',
      yearsOfExperience: 8,
      safetyScore: 96
    });
    assert(driverRes.status === 201 && driverRes.data?.data?._id, 'Onboarded commercial driver with safety score 96');
    const driverId = driverRes.data.data._id;

    // 5. Dispatch & Logistics
    console.log('\n--- Phase 4: Dispatch, Routes & Customer Fulfillment ---');
    const custRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/customers',
      method: 'POST',
      headers: authHeaders
    }, {
      name: 'OmniCorp Global Hub',
      contactPerson: 'Sarah Jenkins',
      phone: '+1 555-0342',
      email: 's.jenkins@omnicorp.com',
      address: {
        street: '100 Industrial Parkway',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30303'
      }
    });
    assert(custRes.status === 201 && custRes.data?.data?._id, 'Created enterprise customer profile');
    const customerId = custRes.data.data._id;

    // Create Trip Dispatch
    const tripRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/trips',
      method: 'POST',
      headers: authHeaders
    }, {
      tripNumber: `TRIP-${Date.now().toString().slice(-6)}`,
      vehicle: vehicleId,
      driver: driverId,
      origin: { address: 'Apex Logistics Terminal, Atlanta, GA' },
      destination: { address: 'OmniCorp Hub, Charlotte, NC' },
      scheduledStart: new Date().toISOString(),
      distanceEstimated: 245
    });
    assert(tripRes.status === 201 && tripRes.data?.data?.status === 'SCHEDULED', 'Scheduled trip dispatch linking vehicle and driver');
    const tripId = tripRes.data.data._id;

    // Create Delivery Order
    const delivRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/deliveries',
      method: 'POST',
      headers: authHeaders
    }, {
      trip: tripId,
      customer: customerId,
      trackingNumber: `PKG-${Date.now().toString().slice(-6)}`,
      deliveryAddress: { street: '100 Industrial Pkwy', city: 'Charlotte', state: 'NC', zipCode: '28202' },
      packagesCount: 14,
      totalWeight: 3200
    });
    assert(delivRes.status === 201 && delivRes.data?.data?.status === 'PENDING', 'Created trackable delivery order linked to dispatch');

    // 6. Maintenance & Fuel Logging
    console.log('\n--- Phase 5: Maintenance & Fuel Operations ---');
    const maintRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/maintenance',
      method: 'POST',
      headers: authHeaders
    }, {
      vehicle: vehicleId,
      type: 'PREVENTIVE',
      title: 'Scheduled 15,000-Mile Engine & Brake Inspection',
      estimatedCost: 650,
      scheduledDate: new Date().toISOString()
    });
    assert(maintRes.status === 201 && maintRes.data?.data?._id, 'Logged preventive maintenance work order');

    const fuelRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/fuel',
      method: 'POST',
      headers: authHeaders
    }, {
      vehicle: vehicleId,
      driver: driverId,
      liters: 120,
      cost: 468,
      odometer: 12620,
      fuelStation: 'Pilot Flying J Travel Plaza',
      date: new Date().toISOString()
    });
    assert(fuelRes.status === 201 && fuelRes.data?.data?._id, 'Recorded fuel refill and cost metrics');

    // 7. Finance & Expense Approval Workflow
    console.log('\n--- Phase 6: Finance & Expense Approvals ---');
    const expRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/expenses',
      method: 'POST',
      headers: authHeaders
    }, {
      category: 'TOLLS',
      amount: 45.50,
      vehicle: vehicleId,
      description: 'I-85 Express Lane Tolls',
      date: new Date().toISOString()
    });
    assert(expRes.status === 201 && expRes.data?.data?.status === 'PENDING', 'Submitted operating expense awaiting approval');
    const expenseId = expRes.data.data._id;

    const approveRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: `/api/expenses/${expenseId}/approve`,
      method: 'PUT',
      headers: authHeaders
    }, {
      action: 'APPROVE',
      reviewNotes: 'Verified via toll transponder log'
    });
    assert(approveRes.status === 200 && approveRes.data?.data?.status === 'APPROVED', 'Approved expense via manager authorization');

    // 8. Analytics Aggregation Check
    console.log('\n--- Phase 7: Real Aggregated Analytics ---');
    const fleetAnalytics = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/analytics/fleet',
      method: 'GET',
      headers: authHeaders
    });
    assert(
      fleetAnalytics.status === 200 &&
      fleetAnalytics.data?.data?.statusDistribution?.length > 0 &&
      fleetAnalytics.data?.data?.typeDistribution?.length > 0,
      'Fleet aggregation pipeline returns real vehicle status and classification counts'
    );

    const financeAnalytics = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/analytics/finance',
      method: 'GET',
      headers: authHeaders
    });
    assert(
      financeAnalytics.status === 200 &&
      financeAnalytics.data?.data?.fuelTrends?.length > 0 &&
      financeAnalytics.data?.data?.expensesByCategory?.length > 0,
      'Financial aggregation pipeline returns real fuel spend and approved expense groups'
    );

    // 9. Dynamic Report Engine
    console.log('\n--- Phase 8: Dynamic Reporting & CSV Generation ---');
    const jsonReport = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/reports/generate',
      method: 'POST',
      headers: authHeaders
    }, {
      module: 'FLEET',
      format: 'JSON'
    });
    assert(jsonReport.status === 200 && jsonReport.data?.data?.length > 0, 'Generated live JSON dataset for FLEET module');

    const csvReport = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/reports/generate',
      method: 'POST',
      headers: authHeaders
    }, {
      module: 'FLEET',
      format: 'CSV'
    });
    assert(
      csvReport.status === 200 &&
      csvReport.headers['content-type']?.includes('text/csv') &&
      csvReport.raw.includes('registrationNumber'),
      'Generated compliant CSV export stream with schema headers'
    );

    // 10. Audit Trail & Integrations
    console.log('\n--- Phase 9: Governance, Audit & Truthful Integrations ---');
    const auditRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/admin/audit-logs',
      method: 'GET',
      headers: authHeaders
    });
    assert(auditRes.status === 200 && auditRes.data?.data?.length > 0, 'Immutable audit ledger recorded events');

    const settingsRes = await request({
      hostname: '127.0.0.1',
      port: API_PORT,
      path: '/api/admin/settings',
      method: 'GET',
      headers: authHeaders
    });
    assert(
      settingsRes.status === 200 &&
      settingsRes.data?.data?.integrations?.gpsTelematics?.enabled === false,
      'Integrations state truthful: unconfigured GPS telematics reflects disabled/not configured'
    );

    // Summary
    console.log('\n=============================================');
    console.log(`🏁 Acceptance Test Results: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('=============================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      console.log('🎉 FLEETFLOW is 100% operational, fully connected, and production-ready!');
      process.exit(0);
    }

  } catch (err) {
    console.error('Fatal error during E2E test execution:', err);
    process.exit(1);
  }
}

runE2ETests();
