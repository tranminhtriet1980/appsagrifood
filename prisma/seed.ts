import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Hỗ trợ ESM và CommonJS interop cho xlsx
const xlsxReader = ((XLSX as any).readFile ? XLSX : (XLSX as any).default) || XLSX;

// Hỗ trợ ESM và CommonJS interop cho bcryptjs
const bcryptWrapper: any = (bcrypt as any).hash ? bcrypt : ((bcrypt as any).default || bcrypt);

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '');
}

// Hàm thử lại tự động khi gặp lỗi kết nối
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  delayMs: number = 2000
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isConnError = err?.message?.includes("Can't reach database") ||
                          err?.message?.includes('Connection refused') ||
                          err?.message?.includes('ECONNREFUSED') ||
                          err?.errorCode === undefined;
      if (isConnError && attempt < maxRetries) {
        console.warn(`  [RETRY] Lần ${attempt}/${maxRetries} thất bại. Đợi ${delayMs}ms rồi thử lại...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

async function main() {
  console.log('=== START DATABASE SEEDING FROM EXCEL ===');

  // 1. Xác định đường dẫn file Excel
  const pathsToTry = [
    path.join(process.cwd(), 'prisma', 'data', 'nhanvien.xlsx'),
    path.join(process.cwd(), 'prisma', 'DATA', 'nhanvien.xlsx'),
    path.join(process.cwd(), 'prisma', 'data', 'nhanvien.xlsx.xlsx'),
    path.join(process.cwd(), 'prisma', 'DATA', 'nhanvien.xlsx.xlsx'),
  ];

  let excelPath = '';
  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      excelPath = p;
      break;
    }
  }

  if (!excelPath) {
    console.error('Lỗi: Không tìm thấy file Excel danh sách nhân viên.');
    console.log('Đã thử quét các đường dẫn sau:');
    pathsToTry.forEach((p) => console.log(` - ${p}`));
    process.exit(1);
  }

  console.log(`Đang đọc dữ liệu từ: ${excelPath}`);

  // 2. Đọc file Excel bằng xlsx
  const workbook = xlsxReader.readFile(excelPath);
  
  // Dò tìm sheet chứa dữ liệu thực tế
  let worksheet: any = null;
  let selectedSheetName = '';

  for (const name of workbook.SheetNames) {
    const ws = workbook.Sheets[name];
    const rows = xlsxReader.utils.sheet_to_json(ws, { header: 1 }) as any[];
    if (rows && rows.length > 0) {
      // Kiểm tra sheet có dữ liệu nhiều cột không
      const hasData = rows.some((r: any) => Array.isArray(r) && r.filter((c: any) => c !== null && c !== undefined && String(c).trim() !== '').length >= 2);
      if (hasData) {
        worksheet = ws;
        selectedSheetName = name;
        // Nếu tên sheet có chữ "nhân viên" hoặc "nhan vien" hoặc "nv", ưu tiên hàng đầu và dừng lại
        const lowerName = name.toLowerCase();
        if (lowerName.includes('nhan') || lowerName.includes('nhân') || lowerName.includes('nv') || lowerName.includes('danh sach')) {
          break;
        }
      }
    }
  }

  if (!worksheet) {
    selectedSheetName = workbook.SheetNames[0];
    worksheet = workbook.Sheets[selectedSheetName];
  }

  console.log(`Đang đọc Sheet: "${selectedSheetName}"`);

  // Chuyển worksheet thành dạng mảng 2 chiều
  const rawRows = xlsxReader.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
  if (rawRows.length === 0) {
    throw new Error('File Excel trống hoặc không có dữ liệu dòng nào.');
  }

  // Dò tìm dòng chứa tiêu đề thực tế (quét 20 dòng đầu)
  let headerRowIdx = -1;
  let bestMatchCount = -1;

  for (let i = 0; i < Math.min(20, rawRows.length); i++) {
    const row = rawRows[i];
    if (!Array.isArray(row)) continue;

    let matchCount = 0;
    const normalizedCells = row.map((cell: any) => cell ? removeVietnameseTones(String(cell)) : '');

    const hasCode = normalizedCells.some((c: any) => ['manv', 'manhanvien', 'employeecode', 'code'].some((kw: string) => c.includes(kw)));
    const hasName = normalizedCells.some((c: any) => ['hoten', 'hovaten', 'ten', 'name'].some((kw: string) => c.includes(kw)));
    const hasRole = normalizedCells.some((c: any) => ['quyen', 'vaitro', 'role', 'chucvu'].some((kw: string) => c.includes(kw)));
    const hasLoc = normalizedCells.some((c: any) => ['vitri', 'chinhanh', 'location', 'branch'].some((kw: string) => c.includes(kw)));

    if (hasCode) matchCount++;
    if (hasName) matchCount++;
    if (hasRole) matchCount++;
    if (hasLoc) matchCount++;

    // Bắt buộc phải khớp cột Họ Tên mới coi là dòng tiêu đề tiềm năng
    if (hasName && matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      headerRowIdx = i;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error('Lỗi cấu trúc: Không thể xác định dòng tiêu đề chứa cột "Họ Tên" trong 20 dòng đầu tiên.');
  }

  const headers = rawRows[headerRowIdx].map((h: any) => String(h || '').trim());
  const normalizedHeaders = headers.map((h: any) => removeVietnameseTones(h));
  console.log(`Phát hiện dòng tiêu đề tại dòng thứ ${headerRowIdx + 1}:`, headers);

  // Tìm index của các cột bằng fuzzy match
  const codeIdx = normalizedHeaders.findIndex((h: any) => ['manv', 'manhanvien', 'employeecode', 'code'].some(kw => h.includes(kw)));
  const nameIdx = normalizedHeaders.findIndex((h: any) => ['hoten', 'hovaten', 'ten', 'name'].some(kw => h.includes(kw)));
  const roleIdx = normalizedHeaders.findIndex((h: any) => ['quyen', 'vaitro', 'role', 'chucvu'].some(kw => h.includes(kw)));
  const locIdx = normalizedHeaders.findIndex((h: any) => ['vitri', 'chinhanh', 'location', 'branch'].some(kw => h.includes(kw)));

  console.log('\n--- KẾT QUẢ ÁNH XẠ CỘT ---');
  console.log(`- Cột Mã NV: ${codeIdx !== -1 ? `"${headers[codeIdx]}" (Index: ${codeIdx})` : 'Không tìm thấy (sẽ dùng Mã tự động)'}`);
  console.log(`- Cột Họ Tên: ${nameIdx !== -1 ? `"${headers[nameIdx]}" (Index: ${nameIdx})` : 'KHÔNG TÌM THẤY (Lỗi)'}`);
  console.log(`- Cột Quyền: ${roleIdx !== -1 ? `"${headers[roleIdx]}" (Index: ${roleIdx})` : 'Không tìm thấy (mặc định staff)'}`);
  console.log(`- Cột Chi nhánh: ${locIdx !== -1 ? `"${headers[locIdx]}" (Index: ${locIdx})` : 'Không tìm thấy'}`);

  if (nameIdx === -1) {
    throw new Error('Lỗi cấu trúc: Không thể xác định cột chứa "Họ Tên" trong Excel.');
  }

  // 3. Chuẩn bị băm mật khẩu mặc định 'Sagri@2026'
  const defaultPasswordStr = 'Sagri@2026';
  const hashedPassword = await bcryptWrapper.hash(defaultPasswordStr, 10);
  console.log(`Mật khẩu mặc định được đặt là: "${defaultPasswordStr}" (Đã băm thành công)`);

  // 4. Duyệt qua từng dòng Excel và chuẩn bị dữ liệu nạp dạng Bulk
  const usersData: any[] = [];

  console.log('\n--- BẮT ĐẦU CHUẨN BỊ DỮ LIỆU NHÂN VIÊN ---');
  for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    // Họ tên
    const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : '';
    if (!name) continue; // Bỏ qua dòng trống

    // Mã nhân viên
    const employee_code = codeIdx !== -1 && row[codeIdx] ? String(row[codeIdx]).trim() : `NV${String(100 + i).padStart(3, '0')}`;

    // Quyền / Vai trò (map với: staff, manager, admin, director)
    const rawRole = roleIdx !== -1 && row[roleIdx] ? String(row[roleIdx]).trim().toLowerCase() : 'staff';
    let role_id = 'staff';
    if (rawRole.includes('admin') || rawRole.includes('trị') || rawRole.includes('tri')) {
      role_id = 'admin';
    } else if (rawRole.includes('manager') || rawRole.includes('quản lý') || rawRole.includes('quan ly') || rawRole.includes('trưởng') || rawRole.includes('truong')) {
      role_id = 'manager';
    } else if (rawRole.includes('director') || rawRole.includes('giám đốc') || rawRole.includes('giam doc')) {
      role_id = 'director';
    }

    // Chi nhánh (chỉ đọc để ghi log)
    const rawLocationName = locIdx !== -1 && row[locIdx] ? String(row[locIdx]).trim() : '';

    usersData.push({
      employee_code,
      name,
      role_id,
      password: hashedPassword,
      join_date: new Date(),
    });

    console.log(`[PREPARE] Mã: ${employee_code} | Tên: ${name} | Vai trò: ${role_id}${rawLocationName ? ` | Chi nhánh (Excel): ${rawLocationName}` : ''}`);
  }

  console.log(`\nTổng số nhân viên chuẩn bị nạp: ${usersData.length}`);

  let successCount = 0;
  let failCount = 0;

  if (usersData.length > 0) {
    const chunkSize = 5;
    const totalChunks = Math.ceil(usersData.length / chunkSize);
    console.log(`\nBắt đầu Chunked Bulk Insert: ${usersData.length} nhân sự chia thành ${totalChunks} cụm (${chunkSize} người/cụm)...`);

    for (let i = 0; i < usersData.length; i += chunkSize) {
      const chunk = usersData.slice(i, i + chunkSize);
      const chunkNum = Math.floor(i / chunkSize) + 1;
      console.log(`\n[CỤM ${chunkNum}/${totalChunks}] Đang nạp ${chunk.length} nhân sự...`);

      try {
        const result = await retryWithDelay(
          () => prisma.user.createMany({ data: chunk, skipDuplicates: true }),
          5,
          2000
        );
        successCount += result.count;
        console.log(`  [OK] Cụm ${chunkNum}: Nạp thành công ${result.count} nhân sự.`);
      } catch (err: any) {
        console.error(`  [FAIL] Cụm ${chunkNum}: Không thể nạp sau 5 lần thử:`, err?.message || err);
        failCount += chunk.length;
      }

      // Nghỉ 1 giây giữa các cụm để DB kịp thở
      if (i + chunkSize < usersData.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    failCount = usersData.length - successCount;
  }

  console.log('\n=== HOÀN THÀNH SEEDING ===');
  console.log(`Tổng số nhân viên nạp thành công: ${successCount}`);
  console.log(`Tổng số nhân viên thất bại (hoặc bỏ qua do trùng mã): ${failCount}`);
}

main()
  .catch((e) => {
    console.error('Lỗi nghiêm trọng trong quá trình seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
