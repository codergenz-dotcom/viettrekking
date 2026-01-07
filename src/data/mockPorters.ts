export type PorterStatus = 'pending' | 'approved' | 'rejected';

export interface Porter {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileUrl: string;
  profileType: string;
  status: PorterStatus;
  appliedAt: string;
  experience: string;
  rejectReason?: string;
}

export const mockPorters: Porter[] = [
  {
    id: 'p1',
    name: 'Nguyễn Văn Hùng',
    email: 'nguyenvanhung@gmail.com',
    phone: '0901234567',
    profileUrl: 'https://drive.google.com/file/d/example1',
    profileType: 'Google Drive',
    status: 'pending',
    appliedAt: '2026-01-02',
    experience: '3 năm kinh nghiệm porter tại Fansipan',
  },
  {
    id: 'p2',
    name: 'Trần Minh Đức',
    email: 'tranminhduc@gmail.com',
    phone: '0912345678',
    profileUrl: 'https://drive.google.com/file/d/example2',
    profileType: 'Google Drive',
    status: 'pending',
    appliedAt: '2026-01-01',
    experience: '5 năm kinh nghiệm tại các cung đường Tây Bắc',
  },
  {
    id: 'p3',
    name: 'Lê Quốc Bảo',
    email: 'lequocbao@gmail.com',
    phone: '0923456789',
    profileUrl: 'https://example.com/cv-lequocbao.pdf',
    profileType: 'PDF',
    status: 'pending',
    appliedAt: '2025-12-30',
    experience: '2 năm kinh nghiệm porter',
  },
  {
    id: 'p4',
    name: 'Phạm Văn Long',
    email: 'phamvanlong@gmail.com',
    phone: '0934567890',
    profileUrl: 'https://drive.google.com/file/d/example4',
    profileType: 'Google Drive',
    status: 'approved',
    appliedAt: '2025-12-25',
    experience: '4 năm kinh nghiệm porter chuyên nghiệp',
  },
  {
    id: 'p5',
    name: 'Hoàng Anh Tuấn',
    email: 'hoanganhtuan@gmail.com',
    phone: '0945678901',
    profileUrl: 'https://example.com/cv-hoanganhtuan.pdf',
    profileType: 'PDF',
    status: 'rejected',
    appliedAt: '2025-12-20',
    experience: '1 năm kinh nghiệm',
    rejectReason: 'Hồ sơ không đầy đủ, thiếu chứng nhận sức khỏe',
  },
  {
    id: 'p6',
    name: 'Vũ Đình Khoa',
    email: 'vudinhkhoa@gmail.com',
    phone: '0956789012',
    profileUrl: 'https://drive.google.com/file/d/example6',
    profileType: 'Google Drive',
    status: 'pending',
    appliedAt: '2026-01-02',
    experience: '6 năm kinh nghiệm, chuyên gia cung đường Tà Xùa',
  },
];

export const porterStatusLabels: Record<PorterStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};
