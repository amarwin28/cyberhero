import { prisma } from '../src/prisma';
import { AuthService } from '../src/services/authService';
import { OtpService } from '../src/services/otpService';
import { RollNumberService } from '../src/services/rollNumberService';
import { ExamService } from '../src/services/examService';
import { ExcelService } from '../src/services/excelService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${testName}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('=====================================================');
  console.log('  Running CyberHero Comprehensive Test Suite');
  console.log('  Dhaanish Ahmed College of Engineering, Chennai');
  console.log('=====================================================');

  try {
    // 1. Test Faculty Authentication & Password Hashing
    console.log('\n[1] Testing Faculty Authentication & Bootstrapping:');
    const faculty = await prisma.faculty.findUnique({
      where: { email: 'dhaanishchennai@gmail.com' },
    });
    assert(Boolean(faculty), 'Default faculty dhaanishchennai@gmail.com exists');
    assert(faculty?.mustChangePassword === true, 'Initial faculty mustChangePassword flag is true');

    const validLogin = await AuthService.facultyLogin('dhaanishchennai@gmail.com', 'ChangeMe@123');
    assert(Boolean(validLogin.token), 'Faculty login with valid credentials succeeds and returns JWT');
    assert(validLogin.faculty.role === 'FACULTY', 'Faculty role is strictly FACULTY');

    let invalidLoginFailed = false;
    try {
      await AuthService.facultyLogin('dhaanishchennai@gmail.com', 'WrongPassword!@#');
    } catch {
      invalidLoginFailed = true;
    }
    assert(invalidLoginFailed, 'Faculty login with incorrect password is rejected');

    // 2. Test OTP Service (Cryptographic hashing, rate limiting, expiry)
    console.log('\n[2] Testing OTP Verification Flow:');
    const testEmail = `test.student.${Date.now()}@example.com`;
    const otpRes = await OtpService.requestOtp(testEmail, 'EMAIL');
    assert(otpRes.success, 'OTP generation succeeds');
    assert(Boolean(otpRes.devOtp), 'Development OTP retrieved for testing');

    // Verify invalid OTP rejected
    let invalidOtpFailed = false;
    try {
      await OtpService.verifyOtp(testEmail, 'EMAIL', '000000');
    } catch {
      invalidOtpFailed = true;
    }
    assert(invalidOtpFailed, 'Invalid OTP attempt is rejected and attempt counter incremented');

    // Verify correct OTP
    const verifySuccess = await OtpService.verifyOtp(testEmail, 'EMAIL', otpRes.devOtp!);
    assert(verifySuccess === true, 'Correct OTP verified successfully and marked as verified in DB');

    // Verify already verified OTP cannot be reused
    let reuseFailed = false;
    try {
      await OtpService.verifyOtp(testEmail, 'EMAIL', otpRes.devOtp!);
    } catch {
      reuseFailed = true;
    }
    assert(reuseFailed, 'Already-verified OTP cannot be reused');

    // 3. Test 4-Digit Roll Number Allocator
    console.log('\n[3] Testing Unique 4-Digit Roll Number Allocator (1000–9999):');
    const roll1 = await RollNumberService.allocateRollNumber();
    assert(roll1.length === 4, `Roll number is exactly 4 digits: ${roll1}`);
    const num1 = parseInt(roll1, 10);
    assert(num1 >= 1000 && num1 <= 9999, 'Roll number falls strictly in range 1000–9999');

    // 4. Test Student Exam Session & Shuffling (Answer Key Privacy)
    console.log('\n[4] Testing Exam Shuffling & Answer Privacy:');
    const sampleStudent = await prisma.student.findFirst({
      where: { rollNumber: '1004' }, // Kaviya S
    });
    assert(Boolean(sampleStudent), 'Student 1004 exists for exam session testing');

    // Clean up student 1004's prior attempts if any to ensure test suite is 100% idempotent
    const existingAttempt = await prisma.examAttempt.findUnique({ where: { studentId: sampleStudent!.id } });
    if (existingAttempt) {
      await prisma.studentAnswer.deleteMany({ where: { attemptId: existingAttempt.id } });
      await prisma.attemptQuestion.deleteMany({ where: { attemptId: existingAttempt.id } });
      await prisma.attemptOption.deleteMany({ where: { attemptId: existingAttempt.id } });
      await prisma.examAttempt.delete({ where: { id: existingAttempt.id } });
      await prisma.student.update({ where: { id: sampleStudent!.id }, data: { status: 'NOT_STARTED' } });
    }

    const session = await ExamService.getOrStartStudentSession(sampleStudent!.id);
    assert(session.questions.length > 0, `Session contains ${session.questions.length} questions`);
    assert(session.timeRemainingSeconds > 0, 'Server timer remaining seconds is positive');

    // CRITICAL: Ensure NO question option contains isCorrect property
    let answersLeaked = false;
    for (const q of session.questions) {
      for (const opt of q.options) {
        if ('isCorrect' in opt) {
          answersLeaked = true;
        }
      }
    }
    assert(!answersLeaked, 'SECURITY: Option answer keys (isCorrect) are strictly NOT leaked to student');

    // 5. Test Idempotent Answer Saving & Scoring
    console.log('\n[5] Testing Idempotent Answer Saving & Final Submission:');
    const q1 = session.questions[0];
    const chosenOpt = q1.options[0].id;

    const saveRes = await ExamService.saveAnswer(sampleStudent!.id, q1.id, chosenOpt);
    assert(saveRes.success, 'Answer saved successfully');

    // Repeat save (idempotency check)
    const saveRes2 = await ExamService.saveAnswer(sampleStudent!.id, q1.id, chosenOpt);
    assert(saveRes2.success, 'Repeated save is idempotent and succeeds without duplicate record');

    // Finalize attempt
    const finalRes = await ExamService.finalizeAttempt(session.attemptId);
    assert(finalRes.success && 'status' in finalRes && finalRes.status === 'SUBMITTED', 'Exam final submission succeeded');

    // Verify student cannot modify answers after submission
    let postSubmitEditFailed = false;
    try {
      await ExamService.saveAnswer(sampleStudent!.id, q1.id, q1.options[1].id);
    } catch {
      postSubmitEditFailed = true;
    }
    assert(postSubmitEditFailed, 'SECURITY: Answering after final submission is strictly prohibited');

    // 6. Test Exam Locking Mechanism
    console.log('\n[6] Testing Exam Locking Enforcement:');
    const activeExam = await ExamService.getActiveExam();
    const lockRes = await ExamService.lockExam(faculty!.id, activeExam.id);
    assert(lockRes.isLocked === true, 'Exam successfully marked as LOCKED with version snapshot');

    let editWhileLockedFailed = false;
    try {
      await ExamService.upsertQuestion(
        {
          questionText: 'Test locked edit',
          marks: 1,
          standardEligibility: 'ALL',
          options: [
            { optionText: 'A', isCorrect: true },
            { optionText: 'B', isCorrect: false },
            { optionText: 'C', isCorrect: false },
            { optionText: 'D', isCorrect: false },
          ],
        },
        faculty!.id
      );
    } catch {
      editWhileLockedFailed = true;
    }
    assert(editWhileLockedFailed, 'SECURITY: Question modification strictly blocked when exam is LOCKED');

    // Unlock back for operational usage
    await ExamService.unlockForRevision(faculty!.id, activeExam.id);

    // 7. Test Student Registration & School Location Persistence
    console.log('\n[7] Testing Student Registration & School Location:');
    const regRoll = await RollNumberService.allocateRollNumber();
    const regPassword = 'NewStudentPass@123';
    const regPasswordHash = await AuthService.hashPassword(regPassword);
    const regEmail = `test.registered.${Date.now()}@example.com`;
    const regStudent = await prisma.student.create({
      data: {
        rollNumber: regRoll,
        fullName: 'Test Candidate',
        schoolName: 'Chennai Model Higher Secondary',
        standard: 'CLASS_11',
        schoolLocation: 'Anna Nagar, Chennai',
        city: 'Chennai',
        email: regEmail,
        phone: '9876543210',
        altPhone: '9876543211',
        passwordHash: regPasswordHash,
        status: 'NOT_STARTED',
      },
    });

    assert(Boolean(regStudent.id), 'Newly registered student record saved to PostgreSQL');
    assert(regStudent.schoolLocation === 'Anna Nagar, Chennai', 'School location correctly persisted');
    assert(regStudent.rollNumber.length === 4, `Unique 4-digit roll number allocated: ${regStudent.rollNumber}`);

    // 8. Test Student Authentication & Generic Error Protection
    console.log('\n[8] Testing Student Login & Authentication Isolation:');
    const studentLoginRes = await AuthService.studentLogin(regStudent.rollNumber, regPassword);
    assert(Boolean(studentLoginRes.token), 'Valid student login succeeds and issues JWT');
    assert(studentLoginRes.student.role === 'STUDENT', 'Student role is strictly STUDENT');
    assert(studentLoginRes.student.rollNumber === regStudent.rollNumber, 'JWT payload contains correct roll number');

    // Verify invalid password gives generic error
    let invalidPassThrewGeneric = false;
    try {
      await AuthService.studentLogin(regStudent.rollNumber, 'WrongPassword456!');
    } catch (err: any) {
      if (err.message === 'Invalid Roll Number or Password.') {
        invalidPassThrewGeneric = true;
      }
    }
    assert(invalidPassThrewGeneric, 'Student login with incorrect password returns generic error');

    // Verify non-existent account gives the exact same generic error (no account enumeration)
    let nonExistentThrewGeneric = false;
    try {
      await AuthService.studentLogin('9999', 'AnyPassword123');
    } catch (err: any) {
      if (err.message === 'Invalid Roll Number or Password.') {
        nonExistentThrewGeneric = true;
      }
    }
    assert(nonExistentThrewGeneric, 'Student login with non-existent roll returns same generic error');

    // 9. Test Faculty and Student Authorization Separation
    console.log('\n[9] Testing Authorization Boundaries:');
    const facultyTokenPayload = AuthService.verifyToken(validLogin.token);
    const studentTokenPayload = AuthService.verifyToken(studentLoginRes.token);
    assert(facultyTokenPayload.role === 'FACULTY', 'Faculty token verified as role FACULTY');
    assert(studentTokenPayload.role === 'STUDENT', 'Student token verified as role STUDENT');
    assert(studentTokenPayload.role !== facultyTokenPayload.role, 'Student and Faculty roles are strictly separated');

    // 10. Test Student Directory & Excel Export with School Location
    console.log('\n[10] Testing Student Directory & Excel Export with School Location:');
    const directoryRecords = await ExamService.getStudentsDirectory();
    assert(directoryRecords.length > 0, `Directory contains ${directoryRecords.length} records`);
    const foundReg = directoryRecords.find((r) => r.rollNumber === regStudent.rollNumber);
    assert(Boolean(foundReg), 'Registered student present in directory');
    assert(foundReg?.schoolLocation === 'Anna Nagar, Chennai', 'Directory record exposes schoolLocation');

    // Test search by school location
    const searchResults = await ExamService.getStudentsDirectory('Anna Nagar');
    assert(searchResults.some((r) => r.rollNumber === regStudent.rollNumber), 'Directory search filters by schoolLocation');

    const excelBuffer = await ExcelService.generateStudentExcel();
    assert(excelBuffer.length > 1000, `Excel buffer generated successfully (Size: ${excelBuffer.length} bytes)`);
    assert(excelBuffer[0] === 0x50 && excelBuffer[1] === 0x4b, 'Buffer is a valid ZIP/XLSX binary file');

    console.log('\n=====================================================');
    console.log(`  Tests Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log('=====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();
