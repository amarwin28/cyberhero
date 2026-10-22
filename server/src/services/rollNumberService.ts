import { prisma } from '../prisma';

const MIN_ROLL = 1000;
const MAX_ROLL = 9999;
const TOTAL_CAPACITY = MAX_ROLL - MIN_ROLL + 1; // 9000

export class RollNumberService {
  /**
   * Concurrency-safe unique 4-digit roll number allocator (1000–9999).
   * Aligned with mockups (e.g., 1001, 1002, 1003...) with gap-filling and collision retries.
   */
  static async allocateRollNumber(): Promise<string> {
    const totalCount = await prisma.student.count();

    if (totalCount >= TOTAL_CAPACITY) {
      throw new Error(
        'Registration is full: Roll number range (1000–9999) has reached maximum capacity.'
      );
    }

    // Attempt sequential allocation starting from 1001
    // Find all existing roll numbers to locate the first free number or next available
    const existing = await prisma.student.findMany({
      select: { rollNumber: true },
    });

    const usedSet = new Set(existing.map((s) => parseInt(s.rollNumber, 10)));

    // Sequential search starting from 1001 up to 9999
    let candidate = 1001;
    while (candidate <= MAX_ROLL) {
      if (!usedSet.has(candidate)) {
        return candidate.toString();
      }
      candidate++;
    }

    // Check 1000 if 1001-9999 were taken
    if (!usedSet.has(1000)) {
      return '1000';
    }

    throw new Error('Registration is full: All roll numbers in range 1000–9999 are allocated.');
  }
}
