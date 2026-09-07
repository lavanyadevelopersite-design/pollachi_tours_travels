const http = require('http');

const post = (path, body, token) =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (err) {
            reject(new Error(`Invalid JSON (${res.statusCode}): ${raw.slice(0, 400)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });

const get = (path, token) =>
  new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (err) {
            reject(new Error(`Invalid JSON (${res.statusCode}): ${raw.slice(0, 400)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });

(async () => {
  const login = await post('/api/auth/login', {
    email: 'admin@tours.com',
    password: 'Admin@123',
  });
  if (!login.body.success) {
    console.error('LOGIN_FAILED', login.status, login.body.message);
    process.exit(1);
  }
  const token = login.body.data.accessToken || login.body.data.access_token;
  const depts = await get('/api/masters/departments?page=1&perPage=5', token);
  const rows = depts.body.data?.rows || depts.body.data || [];
  let deptId = rows[0]?.id;
  if (!deptId) {
    const createdDept = await post(
      '/api/masters/departments',
      {
        department_name: `Optional Code Dept ${Date.now()}`,
        department_code: '',
        is_active: true,
      },
      token
    );
    deptId = createdDept.body.data?.id;
    if (!deptId) {
      console.error('NO_DEPARTMENT', JSON.stringify(createdDept.body).slice(0, 400));
      process.exit(1);
    }
  }

  const name = `Optional Code Test ${Date.now()}`;
  const created = await post(
    '/api/masters/designations',
    {
      designation_name: name,
      designation_code: '',
      department_id: deptId,
      is_active: true,
    },
    token
  );
  console.log(
    JSON.stringify(
      {
        createStatus: created.status,
        success: created.body.success,
        message: created.body.message,
        designation_code: created.body.data?.designation_code ?? null,
        designation_name: created.body.data?.designation_name ?? null,
      },
      null,
      2
    )
  );
  if (!created.body.success) process.exit(1);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
