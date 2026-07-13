import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "محمد أحمد",
    email: "admin@system.com",
    role: "admin",
  },
  {
    id: 2,
    name: "خالد علي",
    email: "supervisor@system.com",
    role: "supervisor",
  },
  {
    id: 3,
    name: "سامي حسن",
    email: "collector@system.com",
    role: "collector",
  },
];

export const mockCredentials = [
  { email: "admin@system.com", password: "admin123", user: mockUsers[0] },
  { email: "supervisor@system.com", password: "super123", user: mockUsers[1] },
  { email: "collector@system.com", password: "collect123", user: mockUsers[2] },
];