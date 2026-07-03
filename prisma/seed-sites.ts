// Seed dữ liệu tối thiểu để chạy nghiệp vụ chấm công:
//  - 2 site siêu thị (có toạ độ GPS + bán kính)
//  - 1 ca hành chính 08:00-17:00
//  - 1 quản lý + 2 nhân viên (mật khẩu: 123456)
// Chạy:  npx ts-node prisma/seed-sites.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('▶ Seed sites, shift, users...');

  // ---- 1. Sites (siêu thị) ----
  const site1 = await prisma.location.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Coop Cống Quỳnh',
      latitude: 10.767_500, // 189C Cống Quỳnh, Q.1, TP.HCM (toạ độ mẫu — chỉnh lại cho đúng thực địa)
      longitude: 106.688_600,
      radius: 100, // mét
    },
  });

  const site2 = await prisma.location.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Coop Lý Thường Kiệt',
      latitude: 10.770_500,
      longitude: 106.658_900,
      radius: 100,
    },
  });

  // ---- 2. Ca hành chính 08:00 - 17:00 ----
  // Cột @db.Time lưu theo UTC — dùng 1970-01-01 làm ngày gốc
  const shift = await prisma.shift.upsert({
    where: { id: 1 },
    update: {},
    create: {
      shift_name: 'Ca hành chính (08:00 - 17:00)',
      start_time: new Date('1970-01-01T08:00:00.000Z'),
      end_time: new Date('1970-01-01T17:00:00.000Z'),
    },
  });

  // ---- 3. Người dùng ----
  const pass = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { employee_code: 'QL001' },
    update: { location_id: site1.id },
    create: {
      employee_code: 'QL001',
      name: 'Trần Quản Lý',
      role_id: 'manager',
      location_id: site1.id,
      join_date: new Date('2020-01-01'),
      password: pass,
    },
  });

  await prisma.user.upsert({
    where: { employee_code: 'NV001' },
    update: { location_id: site1.id },
    create: {
      employee_code: 'NV001',
      name: 'Nguyễn Văn A',
      role_id: 'staff',
      location_id: site1.id,
      join_date: new Date('2022-06-01'),
      password: pass,
    },
  });

  await prisma.user.upsert({
    where: { employee_code: 'NV002' },
    update: { location_id: site2.id },
    create: {
      employee_code: 'NV002',
      name: 'Lê Thị B',
      role_id: 'staff',
      location_id: site2.id,
      join_date: new Date('2023-03-01'),
      password: pass,
    },
  });

  console.log('✔ Done. Sites:', site1.name, '/', site2.name);
  console.log('  Đăng nhập thử: NV001 / 123456 (site Coop Cống Quỳnh)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
