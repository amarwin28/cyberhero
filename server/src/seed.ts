import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { config } from './config';

async function seed() {
  console.log('--- Seeding CyberHero Database ---');

  // 1. Seed Initial Faculty
  const facultyPasswordHash = await bcrypt.hash(config.facultyPassword, 10);
  const faculty = await prisma.faculty.upsert({
    where: { email: config.facultyEmail },
    update: {},
    create: {
      email: config.facultyEmail,
      passwordHash: facultyPasswordHash,
      name: 'Dhaanish Chennai Faculty',
      mustChangePassword: true,
      role: 'FACULTY',
    },
  });
  console.log(`[SEED]: Faculty seeded: ${faculty.email}`);

  // 2. Seed Default Exam
  let exam = await prisma.exam.findFirst();
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        title: 'CyberHero: A Cyber Security Awareness & Knowledge Challenge',
        description: 'Official Online Cybersecurity Examination for Class 10, 11 and 12 Students — Dhaanish Ahmed College of Engineering, Chennai.',
        durationMinutes: 45,
        totalQuestions: 30,
        passingMarks: 15,
        isLocked: false,
        activeVersion: 1,
        allowedStandards: 'ALL',
        allowUnanswered: true,
        status: 'OPEN',
      },
    });
    console.log(`[SEED]: Exam created: "${exam.title}"`);
  }

  // 3. 30 Real Cybersecurity Questions
  const questionsData = [
    {
      q: 'Which of the following is an example of a strong password?',
      opts: ['123456', 'password', 'Cyber@2025!Shield#', 'student123'],
      correct: 2,
      standard: 'ALL',
    },
    {
      q: 'What is phishing in cybersecurity?',
      opts: [
        'A legal network penetration test performed by administrators',
        'A fraudulent attempt to steal sensitive information by disguising as a trustworthy entity',
        'Hardware failure caused by power fluctuation in a server room',
        'A method used to compress database records for faster querying',
      ],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What is the primary function of a network Firewall?',
      opts: [
        'To speed up CPU clock speed during high traffic',
        'To filter incoming and outgoing network traffic according to established security rules',
        'To physically cool down network router switches',
        'To store permanent local backups of all website files',
      ],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What does the "S" stand for in the HTTPS web protocol?',
      opts: ['Standard', 'Secure', 'Server', 'Speed'],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'Which standard network port is used by default for secure HTTPS web traffic?',
      opts: ['Port 80', 'Port 21', 'Port 443', 'Port 25'],
      correct: 2,
      standard: 'ALL',
    },
    {
      q: 'What is Two-Factor Authentication (2FA) / Multi-Factor Authentication (MFA)?',
      opts: [
        'Using two different browsers simultaneously',
        'Requiring two independent forms of identification before granting access',
        'Changing your password twice every single day',
        'Backing up files to two separate local hard drives',
      ],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'Which type of malware locks a user’s files or computer system and demands payment to restore access?',
      opts: ['Adware', 'Ransomware', 'Spyware', 'Keylogger'],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What is a "Social Engineering" attack in cybersecurity?',
      opts: [
        'Manipulating individuals into voluntarily disclosing confidential or sensitive information',
        'Writing malicious machine code that burns CPU hardware',
        'Configuring social media privacy algorithms for marketing',
        'Overloading a web server with artificial network traffic packets',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is the safest practice when connecting to public, unsecured Wi-Fi in a cafe or railway station?',
      opts: [
        'Use an encrypted Virtual Private Network (VPN) and avoid entering banking credentials',
        'Disable your device firewall so connections connect faster',
        'Broadcast your device name openly so other users can verify your identity',
        'Accept all foreign digital root certificates without verification',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is a "Zero-Day Vulnerability"?',
      opts: [
        'A computer system that has survived zero days without a crash',
        'A software security flaw that is known to attackers before the vendor has released a patch',
        'A trial software version that expires at midnight on the first day',
        'An encryption key that contains zero bits of data',
      ],
      correct: 1,
      standard: 'CLASS_11',
    },
    {
      q: 'Under the Indian Information Technology (IT) Act 2000, which section penalizes hacking and unauthorized computer access?',
      opts: ['Section 66', 'Section 12', 'Section 144', 'Section 302'],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What does a "Trojan Horse" malware disguise itself as?',
      opts: [
        'A legitimate, useful software program or game',
        'An operating system kernel crash notification',
        'A high-speed optical fiber cable driver',
        'A hardware memory stick',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'Which of the following describes a "DDoS" (Distributed Denial of Service) attack?',
      opts: [
        'Extracting encrypted database tables through SQL injection vulnerabilities',
        'Flooding a target server with overwhelming traffic from multiple compromised machines (botnet)',
        'Physically disconnecting fiber optic lines from a data center',
        'Deleting user credentials directly from a server terminal',
      ],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What is "Smishing"?',
      opts: [
        'Phishing scams delivered via SMS (text messages) on mobile phones',
        'Extracting deleted files from an SSD drive',
        'Listening to microphone audio across a wireless network',
        'A technique to compress images on web pages',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is the purpose of a digital certificate (SSL/TLS certificate) on an e-commerce website?',
      opts: [
        'To prove the server identity and establish an encrypted session between browser and server',
        'To guarantee that products sold on the site are authentic physical items',
        'To increase the client computer download speed by 50%',
        'To prevent users from capturing screenshots of the page',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What does "PII" stand for in data privacy regulations?',
      opts: [
        'Public Internet Information',
        'Personally Identifiable Information',
        'Private Intercom Infrastructure',
        'Protected Internal Indexing',
      ],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What is a "Man-in-the-Middle" (MitM) attack?',
      opts: [
        'An attacker secretly intercepts and relays communications between two parties who believe they are talking directly',
        'An insider stealing laptops from a corporate office desk',
        'A student sharing exam answers across adjacent desks in a hall',
        'A system reboot occurring halfway through software installation',
      ],
      correct: 0,
      standard: 'CLASS_12',
    },
    {
      q: 'Why should you avoid plugging an untrusted USB flash drive found in public into your laptop?',
      opts: [
        'It could execute malicious code, simulate keystrokes (BadUSB), or deploy spyware',
        'USB drives consume all RAM permanently',
        'It alters the screen resolution to black and white',
        'It erases the computer BIOS battery power',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is the recognized "3-2-1 Backup Rule" in data protection?',
      opts: [
        '3 copies of data, across 2 different storage media, with 1 copy stored off-site',
        'Backing up data at 3 PM, 2 PM, and 1 PM daily',
        'Using 3 passwords, 2 pin codes, and 1 fingerprint biometric',
        'Storing files for 3 years, 2 months, and 1 day',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'Which technique is used to convert human-readable plaintext into unreadable ciphertext?',
      opts: ['Defragmentation', 'Encryption', 'Decryption', 'Virtualization'],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What is "Shoulder Surfing" in information security?',
      opts: [
        'Directly looking over someone’s shoulder to view passwords, PINs, or confidential screen content',
        'Hacking webcams from a remote IP address',
        'Searching through trash cans for thrown-away documents',
        'Attacking networks using radio waves',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is the primary danger of using the exact same password on multiple online services?',
      opts: [
        'If one service is breached, credential-stuffing attackers can compromise all your other accounts',
        'Browsers will refuse to save duplicate passwords',
        'Your internet connection speed will be throttled',
        'Computers require more storage space for identical passwords',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is a "Keylogger"?',
      opts: [
        'A tool that generates strong passwords automatically',
        'Malicious software or hardware that secretly records every keystroke typed by the user',
        'A digital padlock icon shown in the web browser URL bar',
        'A device used to test USB cable throughput',
      ],
      correct: 1,
      standard: 'ALL',
    },
    {
      q: 'What does "End-to-End Encryption" (E2EE) mean in messaging applications?',
      opts: [
        'Only the communicating users can read the messages; no eavesdropping intermediaries or service providers can decrypt them',
        'Messages are encrypted only when your smartphone battery drops below 20%',
        'Messages are permanently deleted every 24 hours automatically',
        'Encryption only works between devices of the exact same brand',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is "Baiting" in social engineering?',
      opts: [
        'Leaving malware-infected physical media (like a branded flash drive) in a visible location to tempt victims into using it',
        'Sending spam promotional emails for shopping discounts',
        'Speeding up internet bandwidth using booster software',
        'Testing ethernet cables for electrical resistance',
      ],
      correct: 0,
      standard: 'CLASS_11',
    },
    {
      q: 'Why are automated operating system and software security updates critical?',
      opts: [
        'They patch newly discovered vulnerabilities before cybercriminals can exploit them',
        'They change your desktop wallpaper to modern designs',
        'They delete all temporary internet history to free storage',
        'They ensure that monitors run at higher refresh rates',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is a "Honeypot" in defensive cybersecurity?',
      opts: [
        'A decoy system or network designed to attract, detect, and analyze attacks by malicious actors',
        'A sweet reward given to ethical hackers who win bug bounties',
        'A virus that infects smartphone touchscreen sensors',
        'A secure password storage manager built into browsers',
      ],
      correct: 0,
      standard: 'CLASS_12',
    },
    {
      q: 'What is "SIM Swapping"?',
      opts: [
        'Fraudulently convincing a mobile carrier to transfer a victim’s phone number to an attacker’s SIM card to intercept SMS 2FA codes',
        'Trading SIM cards with classmates during school hours',
        'Replacing an old 4G SIM card with a new 5G SIM card at an official store',
        'Inserting two SIM cards into a dual-SIM smartphone simultaneously',
      ],
      correct: 0,
      standard: 'ALL',
    },
    {
      q: 'What is an "Evil Twin" attack in wireless networking?',
      opts: [
        'A rogue Wi-Fi access point masquerading as a legitimate network with the same SSID name to steal credentials',
        'A computer with two identical graphics cards operating simultaneously',
        'Two identical virus files uploaded to the same folder',
        'A backup server mirror running in another city',
      ],
      correct: 0,
      standard: 'CLASS_12',
    },
    {
      q: 'What constitutes a healthy "Digital Footprint"?',
      opts: [
        'Being mindful of what you post online, respecting privacy, avoiding oversharing, and using strong privacy controls',
        'Posting your location and contact numbers on public forums daily',
        'Accepting friend requests from complete strangers to grow follower counts',
        'Never clearing temporary files or cookies from your browser',
      ],
      correct: 0,
      standard: 'ALL',
    },
  ];

  // Check if questions already seeded
  const existingQuestions = await prisma.question.count();
  if (existingQuestions === 0) {
    for (const qData of questionsData) {
      await prisma.question.create({
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
      });
    }
    console.log(`[SEED]: Seeded ${questionsData.length} cybersecurity questions.`);
  } else {
    console.log(`[SEED]: ${existingQuestions} questions already present.`);
  }

  // 4. Seed Representative Student Records (as displayed in mockup)
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const sampleStudents = [
    {
      rollNumber: '1001',
      fullName: 'Afiya Kumar',
      schoolName: 'ABC Matric School',
      standard: 'CLASS_10',
      studentAddress: '12 Anna Salai, Guindy',
      schoolLocation: 'Mount Road, Chennai',
      city: 'Chennai',
      email: 'afiya.kumar@example.com',
      phone: '9840123456',
      altPhone: '9840123457',
      status: 'SUBMITTED',
      score: 28,
    },
    {
      rollNumber: '1002',
      fullName: 'Sneha R',
      schoolName: 'Sunshine School',
      standard: 'CLASS_12',
      studentAddress: '34 Beach Road, Thiruvanmiyur',
      schoolLocation: 'ECR Road, Chennai',
      city: 'Chennai',
      email: 'sneha.r@example.com',
      phone: '9840234567',
      altPhone: '9840234568',
      status: 'IN_PROGRESS',
      score: null,
    },
    {
      rollNumber: '1003',
      fullName: 'Mohammed Ali',
      schoolName: 'Crescent Matric H.Sec School',
      standard: 'CLASS_11',
      studentAddress: '56 Mosque Street, Vandalur',
      schoolLocation: 'GST Road, Chennai',
      city: 'Chennai',
      email: 'mohammed.ali@example.com',
      phone: '9840345678',
      altPhone: '9840345679',
      status: 'SUBMITTED',
      score: 29,
    },
    {
      rollNumber: '1004',
      fullName: 'Kaviya S',
      schoolName: 'Govt Hr Sec School',
      standard: 'CLASS_12',
      studentAddress: '78 Gandhi Road, Tambaram',
      schoolLocation: 'Station Road, Tambaram, Chennai',
      city: 'Chennai',
      email: 'kaviya.s@example.com',
      phone: '9840456789',
      altPhone: '9840456780',
      status: 'NOT_STARTED',
      score: null,
    },
    {
      rollNumber: '1005',
      fullName: 'Rahul M',
      schoolName: 'St. Josephs',
      standard: 'CLASS_10',
      studentAddress: '89 Church Lane, Velachery',
      schoolLocation: 'Bypass Road, Velachery, Chennai',
      city: 'Chennai',
      email: 'rahul.m@example.com',
      phone: '9840567890',
      altPhone: '9840567891',
      status: 'SUBMITTED',
      score: 24,
    },
    {
      rollNumber: '1006',
      fullName: 'Divya S',
      schoolName: 'Vivekananda',
      standard: 'CLASS_11',
      studentAddress: '14 Mettu Street, Chromepet',
      schoolLocation: 'GST Road, Chromepet, Chennai',
      city: 'Chennai',
      email: 'divya.s@example.com',
      phone: '9840678901',
      altPhone: '9840678902',
      status: 'IN_PROGRESS',
      score: null,
    },
  ];

  for (const s of sampleStudents) {
    const existingStudent = await prisma.student.findUnique({
      where: { rollNumber: s.rollNumber },
    });

    if (!existingStudent) {
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

      if (s.status !== 'NOT_STARTED') {
        const deadline = new Date(Date.now() + 45 * 60 * 1000);
        await prisma.examAttempt.create({
          data: {
            studentId: createdStudent.id,
            examId: exam.id,
            startedAt: new Date(Date.now() - 30 * 60 * 1000),
            deadlineAt: deadline,
            submittedAt: s.status === 'SUBMITTED' ? new Date(Date.now() - 5 * 60 * 1000) : null,
            score: s.score,
            totalPossibleScore: 30,
            status: s.status,
          },
        });
      }
    }
  }

  console.log(`[SEED]: Seeded ${sampleStudents.length} representative students.`);
  console.log('--- Database Seeding Completed Successfully ---');
}

seed()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
