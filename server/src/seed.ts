import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { config } from './config';
import { mock50Questions } from './mockQuestions';
import { mock20Students } from './mockStudents';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function runMockSeed() {
  console.log('================================================================');
  console.log('  CyberHero Seeding & Mock Run Setup');
  console.log('  Dhaanish Ahmed College of Engineering, Chennai');
  console.log('================================================================\n');

  // 1. Seed Initial Faculty
  const facultyPasswordHash = await bcrypt.hash(config.facultyPassword || 'ChangeMe@123', 10);
  const faculty = await prisma.faculty.upsert({
    where: { email: config.facultyEmail || 'dhaanishchennai@gmail.com' },
    update: {
      passwordHash: facultyPasswordHash,
      name: 'Dhaanish Chennai Faculty',
      role: 'FACULTY',
    },
    create: {
      email: config.facultyEmail || 'dhaanishchennai@gmail.com',
      passwordHash: facultyPasswordHash,
      name: 'Dhaanish Chennai Faculty',
      mustChangePassword: true,
      role: 'FACULTY',
    },
  });
  console.log(`[SEED]: Faculty verified: ${faculty.email}`);

  // 2. Seed Default Exam (Configured for 50 Questions & 60 Minutes)
  let exam = await prisma.exam.findFirst();
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        title: 'CyberHero: A Cyber Security Awareness & Knowledge Challenge',
        description: 'Official Online Cybersecurity Examination for Class 10, 11 and 12 Students — Dhaanish Ahmed College of Engineering, Chennai.',
        durationMinutes: 60,
        totalQuestions: 50,
        passingMarks: 25,
        isLocked: false,
        activeVersion: 1,
        allowedStandards: 'ALL',
        allowUnanswered: true,
        status: 'OPEN',
      },
    });
    console.log(`[SEED]: Exam created: "${exam.title}" (50 Questions, 60 Minutes)`);
  } else {
    exam = await prisma.exam.update({
      where: { id: exam.id },
      data: {
        title: 'CyberHero: A Cyber Security Awareness & Knowledge Challenge',
        description: 'Official Online Cybersecurity Examination for Class 10, 11 and 12 Students — Dhaanish Ahmed College of Engineering, Chennai.',
        durationMinutes: 60,
        totalQuestions: 50,
        passingMarks: 25,
        isLocked: false,
        status: 'OPEN',
      },
    });
    console.log(`[SEED]: Exam updated: "${exam.title}" (50 Questions, 60 Minutes)`);
  }

  // 3. Clean Prior Data and Seed 50 Questions
  console.log('[SEED]: Refreshing Questions and Students...');
  await prisma.studentAnswer.deleteMany();
  await prisma.attemptOption.deleteMany();
  await prisma.attemptQuestion.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();

  const createdQuestions = [];
  for (const qData of mock50Questions) {
    const q = await prisma.question.create({
      data: {
        examId: exam.id,
        questionText: qData.q,
        marks: 1,
        standardEligibility: qData.standard,
        options: {
          create: qData.opts.map((optText, idx) => ({
            optionText: optText,
            isCorrect: idx === qData.correct,
            sortOrder: idx + 1,
          })),
        },
      },
      include: { options: true },
    });
    createdQuestions.push(q);
  }
  console.log(`[SEED]: Successfully seeded ${createdQuestions.length} cybersecurity questions.`);

  // 4. Seed 20 Representative Students Data
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  await prisma.student.deleteMany();

  const now = new Date();

  for (const s of mock20Students) {
    const createdStudent = await prisma.student.create({
      data: {
        rollNumber: s.rollNumber,
        fullName: s.fullName,
        schoolName: s.schoolName,
        standard: s.standard,
        studentAddress: s.studentAddress,
        schoolLocation: s.schoolLocation,
        city: s.city,
        email: s.email,
        phone: s.phone,
        altPhone: s.altPhone,
        passwordHash: studentPasswordHash,
        status: s.status,
      },
    });

    if (s.status === 'SUBMITTED') {
      const minutesAgo = 45 + Math.floor(Math.random() * 20);
      const duration = 25 + Math.floor(Math.random() * 20);
      const startedAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
      const submittedAt = new Date(startedAt.getTime() + duration * 60 * 1000);
      const deadlineAt = new Date(startedAt.getTime() + 60 * 60 * 1000);

      const attempt = await prisma.examAttempt.create({
        data: {
          studentId: createdStudent.id,
          examId: exam.id,
          startedAt,
          deadlineAt,
          submittedAt,
          score: s.score || 40,
          totalPossibleScore: 50,
          status: 'SUBMITTED',
        },
      });

      const eligibleQs = createdQuestions.filter(
        (q) => q.standardEligibility === 'ALL' || q.standardEligibility === s.standard
      );
      const shuffledQs = shuffleArray(eligibleQs).slice(0, 50);
      const targetCorrect = s.score || 40;

      for (let qIdx = 0; qIdx < shuffledQs.length; qIdx++) {
        const q = shuffledQs[qIdx];
        await prisma.attemptQuestion.create({
          data: {
            attemptId: attempt.id,
            questionId: q.id,
            displayOrder: qIdx + 1,
          },
        });

        const shuffledOpts = shuffleArray(q.options);
        for (let oIdx = 0; oIdx < shuffledOpts.length; oIdx++) {
          await prisma.attemptOption.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              optionId: shuffledOpts[oIdx].id,
              displayOrder: oIdx + 1,
            },
          });
        }

        const isCorrect = qIdx < targetCorrect;
        const correctOpt = q.options.find((o) => o.isCorrect);
        const incorrectOpt = q.options.find((o) => !o.isCorrect);
        const chosenOptId = isCorrect ? correctOpt?.id : (incorrectOpt?.id || correctOpt?.id);

        await prisma.studentAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: q.id,
            selectedOptionId: chosenOptId,
            savedAt: new Date(startedAt.getTime() + (qIdx + 1) * 30 * 1000),
            isFinalized: true,
          },
        });
      }
    } else if (s.status === 'IN_PROGRESS') {
      const minutesAgo = 10 + Math.floor(Math.random() * 15);
      const startedAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
      const deadlineAt = new Date(startedAt.getTime() + 60 * 60 * 1000);

      const attempt = await prisma.examAttempt.create({
        data: {
          studentId: createdStudent.id,
          examId: exam.id,
          startedAt,
          deadlineAt,
          status: 'IN_PROGRESS',
        },
      });

      const eligibleQs = createdQuestions.filter(
        (q) => q.standardEligibility === 'ALL' || q.standardEligibility === s.standard
      );
      const shuffledQs = shuffleArray(eligibleQs).slice(0, 50);
      const answeredCount = s.answeredCount || 15;

      for (let qIdx = 0; qIdx < shuffledQs.length; qIdx++) {
        const q = shuffledQs[qIdx];
        await prisma.attemptQuestion.create({
          data: {
            attemptId: attempt.id,
            questionId: q.id,
            displayOrder: qIdx + 1,
          },
        });

        const shuffledOpts = shuffleArray(q.options);
        for (let oIdx = 0; oIdx < shuffledOpts.length; oIdx++) {
          await prisma.attemptOption.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              optionId: shuffledOpts[oIdx].id,
              displayOrder: oIdx + 1,
            },
          });
        }

        if (qIdx < answeredCount) {
          const randOpt = shuffledOpts[Math.floor(Math.random() * shuffledOpts.length)];
          await prisma.studentAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              selectedOptionId: randOpt.id,
              savedAt: new Date(startedAt.getTime() + (qIdx + 1) * 25 * 1000),
              isFinalized: false,
            },
          });
        }
      }
    }
  }

  console.log(`[SEED]: Seeded ${mock20Students.length} representative students:`);
  console.log('         - 12 SUBMITTED (with complete answers & scores)');
  console.log('         - 5 IN_PROGRESS (currently live, taking exam)');
  console.log('         - 3 NOT_STARTED (ready for testing)');
  console.log('\n================================================================');
  console.log('  Database Seeding Completed Successfully');
  console.log('  Faculty Login: dhaanishchennai@gmail.com / ChangeMe@123');
  console.log('  Student Logins: Roll Numbers 1001 to 1020 / Password: Student@123');
  console.log('================================================================');
}

if (require.main === module) {
  runMockSeed()
    .catch((e) => {
      console.error('Seed Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
