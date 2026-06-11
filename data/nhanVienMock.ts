export type NhanVien = {
  id: string;
  maNV: string;
  hoTen: string;
  gioiTinh: 'Nam' | 'Nữ';
  store: string;
  address: string;
  ngayVaoLam: string; // YYYY-MM-DD
  ngayKyHD: string;   // YYYY-MM-DD
};

export const danhSachNhanVienMock: NhanVien[] = [
  {
    id: '1',
    maNV: 'NV115',
    hoTen: 'Trương Ngọc Châu',
    gioiTinh: 'Nữ',
    store: 'Coop Cống Quỳnh',
    address: '189C Cống Quỳnh, Q.1, TP.HCM',
    ngayVaoLam: '2015-05-10',
    ngayKyHD: '2015-07-10',
  },
  {
    id: '2',
    maNV: 'NV050',
    hoTen: 'Lê Minh Thực',
    gioiTinh: 'Nam',
    store: 'Coop Lý Thường Kiệt',
    address: '497 Hòa Hảo, Q.11, TP.HCM',
    ngayVaoLam: '2018-09-15',
    ngayKyHD: '2018-11-15',
  },
  {
    id: '3',
    maNV: 'NV072',
    hoTen: 'Nguyễn Thị Hoa',
    gioiTinh: 'Nữ',
    store: 'BigC Q7',
    address: '99 Nguyễn Thị Thập, Q.7, TP.HCM',
    ngayVaoLam: '2023-01-20',
    ngayKyHD: '2023-03-20',
  },
  {
    id: '4',
    maNV: 'NV088',
    hoTen: 'Trần Văn Nam',
    gioiTinh: 'Nam',
    store: 'Emart Gò Vấp',
    address: '366 Phan Văn Trị, Gò Vấp, TP.HCM',
    ngayVaoLam: '2024-02-15',
    ngayKyHD: '2024-04-15',
  },
  {
    id: '5',
    maNV: 'NV102',
    hoTen: 'Phạm Thị Mai',
    gioiTinh: 'Nữ',
    store: 'Lotte Nam Sài Gòn',
    address: '469 Nguyễn Hữu Thọ, Q.7, TP.HCM',
    ngayVaoLam: '2014-08-05',
    ngayKyHD: '2014-10-05',
  }
];
