export type UserStatus = 'active' | 'inactive' | 'banned';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'porter' | 'admin';
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  tripsJoined: number;
  tripsCreated: number;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn A',
    email: 'user@test.com',
    phone: '0901234567',
    role: 'user',
    status: 'active',
    createdAt: '2025-06-15',
    lastLogin: '2026-01-02',
    tripsJoined: 5,
    tripsCreated: 0,
  },
  {
    id: 'user-2',
    name: 'Trần Thị B',
    email: 'tranthi.b@gmail.com',
    phone: '0912345678',
    role: 'user',
    status: 'active',
    createdAt: '2025-07-20',
    lastLogin: '2026-01-01',
    tripsJoined: 3,
    tripsCreated: 0,
  },
  {
    id: 'user-3',
    name: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0923456789',
    role: 'user',
    status: 'inactive',
    createdAt: '2025-05-10',
    lastLogin: '2025-11-15',
    tripsJoined: 1,
    tripsCreated: 0,
  },
  {
    id: 'user-4',
    name: 'Phạm Thị D',
    email: 'phamthid@yahoo.com',
    phone: '0934567890',
    role: 'user',
    status: 'active',
    createdAt: '2025-08-01',
    lastLogin: '2025-12-28',
    tripsJoined: 8,
    tripsCreated: 0,
  },
  {
    id: 'user-5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    phone: '0945678901',
    role: 'user',
    status: 'banned',
    createdAt: '2025-04-12',
    lastLogin: '2025-09-20',
    tripsJoined: 2,
    tripsCreated: 0,
  },
  {
    id: 'porter-1',
    name: 'Trần Văn Porter',
    email: 'porter@test.com',
    phone: '0956789012',
    role: 'porter',
    status: 'active',
    createdAt: '2025-03-01',
    lastLogin: '2026-01-03',
    tripsJoined: 0,
    tripsCreated: 12,
  },
  {
    id: 'porter-2',
    name: 'Nguyễn Minh Tuấn',
    email: 'minhtuan.porter@gmail.com',
    phone: '0967890123',
    role: 'porter',
    status: 'active',
    createdAt: '2025-02-15',
    lastLogin: '2026-01-02',
    tripsJoined: 0,
    tripsCreated: 8,
  },
  {
    id: 'porter-3',
    name: 'Lê Hoàng Nam',
    email: 'hoangnam.trek@gmail.com',
    phone: '0978901234',
    role: 'porter',
    status: 'active',
    createdAt: '2025-01-20',
    lastLogin: '2025-12-30',
    tripsJoined: 0,
    tripsCreated: 15,
  },
  {
    id: 'admin-1',
    name: 'Admin VietTrekking',
    email: 'admin@viettrekking.com',
    phone: '0989012345',
    role: 'admin',
    status: 'active',
    createdAt: '2024-12-01',
    lastLogin: '2026-01-03',
    tripsJoined: 0,
    tripsCreated: 0,
  },
  {
    id: 'user-6',
    name: 'Võ Thị F',
    email: 'vothif@gmail.com',
    phone: '0990123456',
    role: 'user',
    status: 'active',
    createdAt: '2025-09-10',
    lastLogin: '2025-12-25',
    tripsJoined: 4,
    tripsCreated: 0,
  },
];

export const userStatusLabels: Record<UserStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  banned: 'Đã cấm',
};

export const userRoleLabels: Record<string, string> = {
  user: 'Người dùng',
  porter: 'Porter',
  admin: 'Quản trị viên',
};
