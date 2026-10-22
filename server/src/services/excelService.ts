import ExcelJS from 'exceljs';
import { ExamService } from './examService';

export class ExcelService {
  /**
   * Generates a styled .xlsx buffer for the CyberHero Student Directory & Results
   */
  static async generateStudentExcel(search?: string, standard?: string, status?: string): Promise<Buffer> {
    const students = await ExamService.getStudentsDirectory(search, standard, status);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dhaanish Ahmed College of Engineering, Chennai';
    workbook.lastModifiedBy = 'CyberHero Exam System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('CyberHero Students', {
      views: [{ showGridLines: true }],
    });

    // 1. Institution Title Banner
    sheet.mergeCells('A1:K1');
    const titleCell1 = sheet.getCell('A1');
    titleCell1.value = 'DHAANISH AHMED COLLEGE OF ENGINEERING, CHENNAI';
    titleCell1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF070B19' }, // Dark Navy
    };
    titleCell1.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 28;

    // 2. Subtitle Banner
    sheet.mergeCells('A2:K2');
    const titleCell2 = sheet.getCell('A2');
    titleCell2.value = 'CyberHero — Cybersecurity Awareness & Knowledge Challenge (Class 10–12)';
    titleCell2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF00D2FF' } }; // Electric Cyan
    titleCell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B1228' },
    };
    titleCell2.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 22;

    // 3. Export Metadata
    sheet.mergeCells('A3:K3');
    const metaCell = sheet.getCell('A3');
    metaCell.value = `Export Date: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} | Total Records: ${students.length}`;
    metaCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF94A3B8' } };
    metaCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF111C3D' },
    };
    metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(3).height = 18;

    // Row 4: Blank spacing
    sheet.getRow(4).height = 8;

    // 4. Table Column Headers
    const headers = [
      'Roll No',
      'Student Name',
      'School Name',
      'School Location',
      'Standard',
      'City / Town',
      'Email Address',
      'Phone Number',
      'Status',
      'Score',
      'Submission Time',
    ];

    const headerRow = sheet.getRow(5);
    headerRow.height = 26;

    headers.forEach((h, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = h;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0070F3' }, // Bright Blue
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF00D2FF' } },
        bottom: { style: 'medium', color: { argb: 'FF00D2FF' } },
        left: { style: 'thin', color: { argb: 'FF00D2FF' } },
        right: { style: 'thin', color: { argb: 'FF00D2FF' } },
      };
    });

    // 5. Populate Student Data Rows
    students.forEach((s, idx) => {
      const rowNum = 6 + idx;
      const row = sheet.getRow(rowNum);
      row.height = 20;

      const isEven = idx % 2 === 0;
      const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

      let scoreDisplay = '-';
      if (s.status === 'SUBMITTED' && s.score !== null) {
        scoreDisplay = `${s.score} / ${s.totalMarks || 30}`;
      } else if (s.status === 'IN_PROGRESS') {
        scoreDisplay = 'Provisional (In Progress)';
      }

      const rowValues = [
        s.rollNumber,
        s.name,
        s.school,
        s.schoolLocation || '-',
        s.standard,
        s.city,
        s.email,
        s.phone,
        s.status === 'SUBMITTED' ? 'Submitted' : s.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started',
        scoreDisplay,
        s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString('en-US') : '-',
      ];

      rowValues.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        cell.font = { name: 'Arial', size: 9.5, color: { argb: 'FF0F172A' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBg },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colIdx === 0 || colIdx === 4 || colIdx === 8 || colIdx === 9 || colIdx === 10 ? 'center' : 'left',
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Status highlight
        if (colIdx === 8) {
          if (val === 'Submitted') {
            cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF059669' } };
          } else if (val === 'In Progress') {
            cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFD97706' } };
          }
        }
      });
    });

    // 6. Set explicit column widths
    const colWidths = [12, 24, 28, 24, 12, 18, 28, 16, 16, 22, 18];
    colWidths.forEach((w, i) => {
      sheet.getColumn(i + 1).width = w;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
