import { prisma } from '../src/prisma';

async function main() {
  console.log('--- STARTING E2E API VERIFICATION ---');
  const baseUrl = 'http://127.0.0.1:5000';

  // 1. Request OTP for new student
  const testEmail = `student.e2e.${Date.now()}@example.com`;
  console.log(`\n1. Requesting OTP for: ${testEmail}`);
  const otpReqRes = await fetch(`${baseUrl}/api/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testEmail, channel: 'EMAIL' }),
  });
  const otpReqData = (await otpReqRes.json()) as any;
  console.log('OTP Request Response:', otpReqData);
  if (!otpReqData.success || !otpReqData.devOtp) {
    throw new Error('Failed to request OTP');
  }

  // 2. Verify OTP
  console.log(`\n2. Verifying OTP with code: ${otpReqData.devOtp}`);
  const otpVerifyRes = await fetch(`${baseUrl}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: testEmail, channel: 'EMAIL', otp: otpReqData.devOtp }),
  });
  const otpVerifyData = (await otpVerifyRes.json()) as any;
  console.log('OTP Verify Response:', otpVerifyData);
  if (!otpVerifyData.success) {
    throw new Error('Failed to verify OTP');
  }

  // 3. Register student with schoolLocation
  console.log('\n3. Registering student with schoolLocation...');
  const studentPassword = 'SecureStudent@2026';
  const regRes = await fetch(`${baseUrl}/api/auth/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Arun Mozhi Varman',
      schoolName: 'Govt Model Higher Secondary School',
      standard: 'CLASS_12',
      schoolLocation: 'Anna Nagar West, Chennai',
      city: 'Chennai',
      email: testEmail,
      phone: '9840112233',
      altPhone: '9840112244',
      password: studentPassword,
      verificationChannel: 'EMAIL',
      otp: otpReqData.devOtp,
    }),
  });
  const regData = (await regRes.json()) as any;
  console.log('Student Registration Response:', regData);
  if (!regData.success || !regData.data?.rollNumber) {
    throw new Error('Student registration failed');
  }
  const assignedRoll = regData.data.rollNumber;
  console.log(`✔ Student Registered Successfully! Assigned Roll Number: ${assignedRoll}`);

  // Verify in PostgreSQL database
  const dbStudent = await prisma.student.findUnique({ where: { rollNumber: assignedRoll } });
  if (!dbStudent || dbStudent.schoolLocation !== 'Anna Nagar West, Chennai') {
    throw new Error(`DB verification failed: schoolLocation is ${dbStudent?.schoolLocation}`);
  }
  console.log(`✔ Verified in PostgreSQL: Student ${assignedRoll} has schoolLocation="${dbStudent.schoolLocation}"`);

  // 4. Test Student Login with valid credentials
  console.log('\n4. Testing Student Login with valid credentials...');
  const studentLoginRes = await fetch(`${baseUrl}/api/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rollNumber: assignedRoll, password: studentPassword }),
  });
  const studentLoginData = (await studentLoginRes.json()) as any;
  console.log('Student Login Response:', studentLoginData);
  if (!studentLoginData.success || !studentLoginData.data?.token) {
    throw new Error('Student login failed');
  }
  const studentToken = studentLoginData.data.token;
  console.log('✔ Student login successful. Received valid session token.');

  // 5. Test Student Login with wrong password
  console.log('\n5. Testing Student Login with wrong password (expecting generic error)...');
  const wrongPassRes = await fetch(`${baseUrl}/api/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rollNumber: assignedRoll, password: 'WrongPassword@999' }),
  });
  const wrongPassData = (await wrongPassRes.json()) as any;
  console.log('Wrong Password Response (Status:', wrongPassRes.status, '):', wrongPassData);
  if (wrongPassRes.status !== 401 || wrongPassData.error !== 'Invalid Roll Number or Password.') {
    throw new Error(`Expected generic 401 'Invalid Roll Number or Password.', got: ${JSON.stringify(wrongPassData)}`);
  }
  console.log('✔ Correctly received generic 401 error message for wrong password.');

  // 6. Test Student Login with non-existent roll number
  console.log('\n6. Testing Student Login with non-existent roll number (expecting identical generic error)...');
  const nonExistRes = await fetch(`${baseUrl}/api/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rollNumber: '9999', password: 'SomePassword123' }),
  });
  const nonExistData = (await nonExistRes.json()) as any;
  console.log('Non-existent Account Response (Status:', nonExistRes.status, '):', nonExistData);
  if (nonExistRes.status !== 401 || nonExistData.error !== 'Invalid Roll Number or Password.') {
    throw new Error(`Expected generic 401 'Invalid Roll Number or Password.', got: ${JSON.stringify(nonExistData)}`);
  }
  console.log('✔ Correctly received identical generic 401 error message for non-existent account (no enumeration).');

  // 7. Verify Student cannot access faculty endpoints
  console.log('\n7. Testing Student attempting to access faculty dashboard stats (expecting 403 Forbidden)...');
  const studentAccessFacultyRes = await fetch(`${baseUrl}/api/faculty/dashboard/stats`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentAccessFacultyData = (await studentAccessFacultyRes.json()) as any;
  console.log('Student accessing faculty route (Status:', studentAccessFacultyRes.status, '):', studentAccessFacultyData);
  if (studentAccessFacultyRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden, got ${studentAccessFacultyRes.status}`);
  }
  console.log('✔ Access strictly denied for student token on faculty route.');

  // 8. Test Faculty Login
  console.log('\n8. Testing Faculty Login...');
  const facultyLoginRes = await fetch(`${baseUrl}/api/auth/faculty/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dhaanishchennai@gmail.com', password: 'ChangeMe@123' }),
  });
  const facultyLoginData = (await facultyLoginRes.json()) as any;
  console.log('Faculty Login Response:', facultyLoginData);
  if (!facultyLoginData.success || !facultyLoginData.data?.token) {
    throw new Error('Faculty login failed');
  }
  const facultyToken = facultyLoginData.data.token;
  console.log('✔ Faculty login successful.');

  // 9. Fetch Student Directory with Faculty Token & Check School Location
  console.log('\n9. Fetching Student Directory as Faculty...');
  const directoryRes = await fetch(`${baseUrl}/api/faculty/students`, {
    headers: { Authorization: `Bearer ${facultyToken}` },
  });
  const directoryData = (await directoryRes.json()) as any;
  console.log(`Directory records count: ${directoryData.data?.length}`);
  const registeredRecord = directoryData.data?.find((r: any) => r.rollNumber === assignedRoll);
  console.log('Found Registered Student Record:', registeredRecord);
  if (!registeredRecord || registeredRecord.schoolLocation !== 'Anna Nagar West, Chennai') {
    throw new Error(`Directory record missing or incorrect schoolLocation: ${JSON.stringify(registeredRecord)}`);
  }
  console.log('✔ Student directory correctly includes schoolLocation="Anna Nagar West, Chennai"!');

  // 10. Search Student Directory by School Location
  console.log('\n10. Searching Student Directory by school location "Anna Nagar"...');
  const searchRes = await fetch(`${baseUrl}/api/faculty/students?search=Anna+Nagar`, {
    headers: { Authorization: `Bearer ${facultyToken}` },
  });
  const searchData = (await searchRes.json()) as any;
  const searchFound = searchData.data?.some((r: any) => r.rollNumber === assignedRoll);
  if (!searchFound) {
    throw new Error('Search by schoolLocation failed');
  }
  console.log('✔ Search by school location successfully matched student!');

  // 11. Download Excel Spreadsheet
  console.log('\n11. Downloading Excel Spreadsheet as Faculty...');
  const excelRes = await fetch(`${baseUrl}/api/faculty/students/export-excel`, {
    headers: { Authorization: `Bearer ${facultyToken}` },
  });
  const excelBuffer = await excelRes.arrayBuffer();
  console.log(`Excel downloaded size: ${excelBuffer.byteLength} bytes`);
  const excelBytes = new Uint8Array(excelBuffer);
  if (excelBytes[0] !== 0x50 || excelBytes[1] !== 0x4B) {
    throw new Error('Excel is not valid XLSX ZIP format');
  }
  console.log('✔ Excel spreadsheet generated with valid XLSX binary format.');

  console.log('\n======================================================');
  console.log('  ALL E2E VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('E2E Verification Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
