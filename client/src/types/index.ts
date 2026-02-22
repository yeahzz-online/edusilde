export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'SMARTBOARD';
    departmentId?: string;
    semester?: number;
    department?: Department;
}

export interface Department {
    id: string;
    name: string;
    _count?: { users: number; classes: number; subjects: number };
}

export interface Class {
    id: string;
    name: string;
    departmentId: string;
    department?: { id: string; name: string };
    _count?: { subjects: number };
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    departmentId: string;
    classId: string;
    department?: { id: string; name: string };
    class?: { id: string; name: string };
    _count?: { presentations: number };
}

export interface Presentation {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    subjectId: string;
    uploaderId: string;
    subject?: Subject;
    uploader?: { id: string; name: string; email: string };
    createdAt: string;
    updatedAt: string;
}

export interface Smartboard {
    id: string;
    name: string;
    location: string;
    code: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
