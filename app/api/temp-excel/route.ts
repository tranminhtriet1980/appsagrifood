import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export async function GET() {
  try {
    const xlsxReader = ((XLSX as any).readFile ? XLSX : (XLSX as any).default) || XLSX;
    const filePath = path.join(process.cwd(), 'prisma', 'DATA', 'nhanvien.xlsx');
    const fallbackPath = path.join(process.cwd(), 'prisma', 'data', 'nhanvien.xlsx');
    const actualPath = fs.existsSync(filePath) ? filePath : fallbackPath;

    if (!fs.existsSync(actualPath)) {
      return NextResponse.json({ error: `File not found at ${filePath} or ${fallbackPath}` }, { status: 404 });
    }

    const workbook = xlsxReader.readFile(actualPath);
    
    let worksheet: any = null;
    let selectedSheetName = '';
    for (const name of workbook.SheetNames) {
      const ws = workbook.Sheets[name];
      const rows = xlsxReader.utils.sheet_to_json(ws, { header: 1 }) as any[];
      if (rows && rows.length > 0) {
        worksheet = ws;
        selectedSheetName = name;
        break;
      }
    }
    
    if (!worksheet) {
      return NextResponse.json({ error: 'No data sheet found' }, { status: 400 });
    }
    
    const rawRows = xlsxReader.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
    const jsonData = xlsxReader.utils.sheet_to_json(worksheet, { defval: "" }) as any[];
    
    return NextResponse.json({
      sheetName: selectedSheetName,
      rawRowsLength: rawRows.length,
      jsonDataLength: jsonData.length,
      jsonData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
