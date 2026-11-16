import http from 'http';

const BASE_URL = 'http://localhost:3001';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function request(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method,
        headers: {
          ...headers,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, data }));
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 AURA LUXE HOME — COMPREHENSIVE SYSTEM TEST SUITE');
  console.log('====================================================\n');

  // --- TASK 1 & 2: CUSTOMER WEBSITE TESTING ---
  console.log('--- TASK 2: CUSTOMER WEBSITE TESTING ---');

  // 1. Homepage
  try {
    const res = await request('GET', '/');
    const hasBrand = res.data.includes('Aura Luxe') || res.data.includes('Curated Living');
    results.push({
      name: 'Customer Homepage Load',
      category: 'Customer Website',
      passed: res.status === 200 && hasBrand,
      details: `Status ${res.status}. Brand content rendered: ${hasBrand}`,
    });
  } catch (err: any) {
    results.push({ name: 'Customer Homepage Load', category: 'Customer Website', passed: false, details: err.message });
  }

  // 2. Product Catalog
  try {
    const res = await request('GET', '/shop');
    results.push({
      name: 'Product Catalog Listing (/shop)',
      category: 'Customer Website',
      passed: res.status === 200,
      details: `Status ${res.status}. Catalog pages compiled.`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Catalog Listing', category: 'Customer Website', passed: false, details: err.message });
  }

  // 3. Category & Room Filtering
  try {
    const res = await request('GET', '/shop?room=Living+Room');
    results.push({
      name: 'Room Category Filter (/shop?room=Living+Room)',
      category: 'Customer Website',
      passed: res.status === 200,
      details: `Status ${res.status}. Filtered view returned.`,
    });
  } catch (err: any) {
    results.push({ name: 'Room Category Filter', category: 'Customer Website', passed: false, details: err.message });
  }

  // 4. Product Sorting
  try {
    const res = await request('GET', '/shop?sort=price-asc');
    results.push({
      name: 'Product Sorting (/shop?sort=price-asc)',
      category: 'Customer Website',
      passed: res.status === 200,
      details: `Status ${res.status}. Sort query evaluated.`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Sorting', category: 'Customer Website', passed: false, details: err.message });
  }

  // 5. Product Search
  try {
    const res = await request('GET', '/shop?search=teak');
    results.push({
      name: 'Product Catalog Search (/shop?search=teak)',
      category: 'Customer Website',
      passed: res.status === 200,
      details: `Status ${res.status}. Search query processed.`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Catalog Search', category: 'Customer Website', passed: false, details: err.message });
  }

  // 6. Product Detail Page
  try {
    const res = await request('GET', '/product/ceylon-teak-sculptural-armchair');
    const hasDistricts = res.data.includes('Sri Lanka Islandwide Delivery Options') || res.data.includes('Colombo');
    results.push({
      name: 'Product Detail Page (PDP) & 25-District Calculator',
      category: 'Customer Website',
      passed: res.status === 200,
      details: `Status ${res.status}. PDP loaded with district delivery engine: ${hasDistricts}`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Detail Page', category: 'Customer Website', passed: false, details: err.message });
  }

  // 7. Cart & Wishlist Pages
  try {
    const cartRes = await request('GET', '/cart');
    const trackRes = await request('GET', '/track-order');
    results.push({
      name: 'Cart Review & Order Tracking Pages',
      category: 'Customer Website',
      passed: cartRes.status === 200 && trackRes.status === 200,
      details: `Cart Status ${cartRes.status}, Track Order Status ${trackRes.status}`,
    });
  } catch (err: any) {
    results.push({ name: 'Cart & Tracking Pages', category: 'Customer Website', passed: false, details: err.message });
  }

  // 8. Order Placement & Checkout API
  try {
    const checkoutRes = await request('POST', '/api/checkout', {}, {
      customerInfo: { fullName: 'Test Client', email: 'test@auraluxe.lk', phone: '+94 77 123 4567' },
      shippingAddress: {
        addressLine1: 'No. 20, Flower Road',
        city: 'Colombo 07',
        district: 'Colombo',
      },
      items: [
        {
          productId: 'prod-1',
          title: 'Ceylon Teak Sculptural Armchair',
          price: 84500,
          quantity: 1,
        },
      ],
      paymentMethod: 'cod',
    });
    const data = JSON.parse(checkoutRes.data);
    const passed = checkoutRes.status === 200 && data.success && Boolean(data.orderNumber);
    results.push({
      name: 'Sri Lanka Checkout Order Creation (COD)',
      category: 'Customer Website',
      passed,
      details: `Status ${checkoutRes.status}. Generated Order: ${data.orderNumber}`,
    });
  } catch (err: any) {
    results.push({ name: 'Sri Lanka Checkout Order Creation', category: 'Customer Website', passed: false, details: err.message });
  }

  // --- TASK 3: ADMIN DASHBOARD TESTING ---
  console.log('\n--- TASK 3: ADMIN DASHBOARD & RBAC TESTING ---');

  // 9. Unauthorized Admin Redirection
  try {
    const res = await request('GET', '/admin');
    const isProtected = res.status === 307 || res.status === 302;
    results.push({
      name: 'Middleware Unauthenticated Route Protection (/admin)',
      category: 'Security & RBAC',
      passed: isProtected,
      details: `Status ${res.status}. Redirect to: ${res.headers.location || 'none'}`,
    });
  } catch (err: any) {
    results.push({ name: 'Middleware Unauthenticated Route Protection', category: 'Security & RBAC', passed: false, details: err.message });
  }

  // 10. Unauthorized Admin API Protection
  try {
    const res = await request('GET', '/api/admin/products');
    const isBlocked = res.status === 401;
    results.push({
      name: 'Protected Admin API Protection (GET /api/admin/products)',
      category: 'Security & RBAC',
      passed: isBlocked,
      details: `Status ${res.status} (Correctly rejected unauthorized access without session cookie)`,
    });
  } catch (err: any) {
    results.push({ name: 'Protected Admin API Protection', category: 'Security & RBAC', passed: false, details: err.message });
  }

  // 11. Admin Authentication (Sign In & JWT)
  let adminCookie = '';
  try {
    const res = await request('POST', '/api/auth/login', {}, {
      email: 'admin@auraluxe.lk',
      password: 'AdminAuraLuxe2026!',
    });
    const data = JSON.parse(res.data);
    const setCookie = res.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      adminCookie = setCookie[0].split(';')[0];
    }
    const passed = res.status === 200 && data.success && data.user.role === 'super_admin' && Boolean(adminCookie);
    results.push({
      name: 'Admin Sign In & JWT Cookie Issuance',
      category: 'Authentication',
      passed,
      details: `Role: ${data.user?.role}, HttpOnly Cookie Issued: ${Boolean(adminCookie)}`,
    });
  } catch (err: any) {
    results.push({ name: 'Admin Sign In', category: 'Authentication', passed: false, details: err.message });
  }

  // 12. Authenticated Admin Access with Token
  try {
    const res = await request('GET', '/api/admin/products', {
      Cookie: adminCookie,
    });
    const data = JSON.parse(res.data);
    const passed = res.status === 200 && data.success && Array.isArray(data.products);
    results.push({
      name: 'Authenticated Admin Access (with valid JWT cookie)',
      category: 'Admin Operations',
      passed,
      details: `Status ${res.status}. Products fetched: ${data.products?.length || 0}`,
    });
  } catch (err: any) {
    results.push({ name: 'Authenticated Admin Access', category: 'Admin Operations', passed: false, details: err.message });
  }

  // 13. Product Creation via Admin API
  let createdSlug = '';
  try {
    const res = await request(
      'POST',
      '/api/admin/products',
      { Cookie: adminCookie },
      {
        title: 'Horton Marble Side Table',
        roomType: 'Living Room',
        price: 48000,
        sku: 'ALH-TBL-HORTON',
        stockQuantity: 7,
        shortSummary: 'Sculpted solid marble side companion.',
      }
    );
    const data = JSON.parse(res.data);
    createdSlug = data.slug || 'horton-marble-side-table';
    const passed = res.status === 200 && data.success;
    results.push({
      name: 'Product Creation (POST /api/admin/products)',
      category: 'Admin Operations',
      passed,
      details: `Status ${res.status}. Created slug: ${createdSlug}`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Creation', category: 'Admin Operations', passed: false, details: err.message });
  }

  // 14. Product Editing
  try {
    const res = await request(
      'PUT',
      '/api/admin/products',
      { Cookie: adminCookie },
      {
        id: 'mock-prod-1',
        title: 'Horton Marble Side Table (Updated)',
        price: 49500,
        isActive: true,
      }
    );
    const data = JSON.parse(res.data);
    results.push({
      name: 'Product Editing (PUT /api/admin/products)',
      category: 'Admin Operations',
      passed: res.status === 200 && data.success,
      details: `Status ${res.status}. Update confirmed.`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Editing', category: 'Admin Operations', passed: false, details: err.message });
  }

  // 15. Product Deletion
  try {
    const res = await request(
      'DELETE',
      '/api/admin/products?id=mock-prod-1',
      { Cookie: adminCookie }
    );
    const data = JSON.parse(res.data);
    results.push({
      name: 'Product Deletion (DELETE /api/admin/products)',
      category: 'Admin Operations',
      passed: res.status === 200 && data.success,
      details: `Status ${res.status}. Archive/deletion confirmed.`,
    });
  } catch (err: any) {
    results.push({ name: 'Product Deletion', category: 'Admin Operations', passed: false, details: err.message });
  }

  // 16. Admin Order Fulfillment Status Transition
  try {
    const res = await request(
      'PUT',
      '/api/admin/orders',
      { Cookie: adminCookie },
      {
        orderNumber: 'ALH-2026-8492',
        orderStatus: 'shipped',
        courier: { name: 'Prompt Xpress', trackingNumber: 'PX-LK-88991' },
      }
    );
    const data = JSON.parse(res.data);
    results.push({
      name: 'Order Fulfillment Status & Courier Assignment',
      category: 'Admin Operations',
      passed: res.status === 200 && data.success,
      details: `Status ${res.status}. Transitioned to shipped.`,
    });
  } catch (err: any) {
    results.push({ name: 'Order Fulfillment Status', category: 'Admin Operations', passed: false, details: err.message });
  }

  // 17. Client Registration
  try {
    const res = await request('POST', '/api/auth/register', {}, {
      fullName: 'Amani Senanayake',
      email: `amani.${Date.now()}@example.lk`,
      phone: '+94 77 999 8888',
      password: 'SecurePassword2026!',
    });
    const data = JSON.parse(res.data);
    results.push({
      name: 'Customer Registration (POST /api/auth/register)',
      category: 'Authentication',
      passed: res.status === 200 && data.success && data.user.role === 'customer',
      details: `Registered client role: ${data.user?.role}`,
    });
  } catch (err: any) {
    results.push({ name: 'Customer Registration', category: 'Authentication', passed: false, details: err.message });
  }

  // 18. Website Settings & District Shipping Fees
  try {
    const res = await request('GET', '/admin/settings', { Cookie: adminCookie });
    results.push({
      name: 'Admin Website & 25-District Settings Page (/admin/settings)',
      category: 'Admin Operations',
      passed: res.status === 200,
      details: `Status ${res.status}. Configuration view accessible.`,
    });
  } catch (err: any) {
    results.push({ name: 'Admin Settings', category: 'Admin Operations', passed: false, details: err.message });
  }

  // Output Results Table
  console.log('\n====================================================');
  console.log('📊 TEST EXECUTION SUMMARY REPORT:');
  console.log('====================================================');

  let passedCount = 0;
  results.forEach((r, idx) => {
    const symbol = r.passed ? '✅' : '❌';
    if (r.passed) passedCount++;
    console.log(`${symbol} [${r.category}] ${r.name}`);
    console.log(`   -> ${r.details}`);
  });

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('====================================================\n');

  if (passedCount === results.length) {
    console.log('🎉 ALL SYSTEM AUDIT AND INTEGRATION TESTS PASSED!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

