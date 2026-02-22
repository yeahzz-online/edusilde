import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create departments
    const csDept = await prisma.department.upsert({
        where: { name: 'Computer Science' },
        update: {},
        create: { name: 'Computer Science' },
    });

    const eceDept = await prisma.department.upsert({
        where: { name: 'Electronics & Communication' },
        update: {},
        create: { name: 'Electronics & Communication' },
    });

    const mechDept = await prisma.department.upsert({
        where: { name: 'Mechanical Engineering' },
        update: {},
        create: { name: 'Mechanical Engineering' },
    });

    const civilDept = await prisma.department.upsert({
        where: { name: 'Civil Engineering' },
        update: {},
        create: { name: 'Civil Engineering' },
    });

    console.log('✅ Departments created');

    // Create classes
    const csClass1 = await prisma.class.upsert({
        where: { id: 'cs-class-1' },
        update: {},
        create: {
            id: 'cs-class-1',
            name: 'CS-A',
            departmentId: csDept.id,
        },
    });

    const csClass2 = await prisma.class.upsert({
        where: { id: 'cs-class-2' },
        update: {},
        create: {
            id: 'cs-class-2',
            name: 'CS-B',
            departmentId: csDept.id,
        },
    });

    console.log('✅ Classes created');

    // Create subjects
    await prisma.subject.upsert({
        where: { id: 'sub-dsa' },
        update: {},
        create: {
            id: 'sub-dsa',
            name: 'Data Structures & Algorithms',
            code: 'CS301',
            departmentId: csDept.id,
            classId: csClass1.id,
        },
    });

    await prisma.subject.upsert({
        where: { id: 'sub-dbms' },
        update: {},
        create: {
            id: 'sub-dbms',
            name: 'Database Management Systems',
            code: 'CS302',
            departmentId: csDept.id,
            classId: csClass1.id,
        },
    });

    await prisma.subject.upsert({
        where: { id: 'sub-os' },
        update: {},
        create: {
            id: 'sub-os',
            name: 'Operating Systems',
            code: 'CS303',
            departmentId: csDept.id,
            classId: csClass2.id,
        },
    });

    await prisma.subject.upsert({
        where: { id: 'sub-cn' },
        update: {},
        create: {
            id: 'sub-cn',
            name: 'Computer Networks',
            code: 'CS304',
            departmentId: csDept.id,
            classId: csClass2.id,
        },
    });

    console.log('✅ Subjects created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@eduslide.com' },
        update: {},
        create: {
            email: 'admin@eduslide.com',
            password: adminPassword,
            name: 'System Administrator',
            role: 'ADMIN',
            isVerified: true,
        },
    });

    // Create faculty user
    const facultyPassword = await bcrypt.hash('faculty123', 10);
    const faculty = await prisma.user.upsert({
        where: { email: 'faculty@eduslide.com' },
        update: {},
        create: {
            email: 'faculty@eduslide.com',
            password: facultyPassword,
            name: 'Dr. Sarah Johnson',
            role: 'FACULTY',
            departmentId: csDept.id,
            isVerified: true,
        },
    });

    // Create student user
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@eduslide.com' },
        update: {},
        create: {
            email: 'student@eduslide.com',
            password: studentPassword,
            name: 'Alex Thompson',
            role: 'STUDENT',
            departmentId: csDept.id,
            semester: 3,
            isVerified: true,
        },
    });

    console.log('✅ Users created');
    console.log('');
    console.log('🎉 Seed complete!');
    console.log('');
    console.log('Demo Accounts:');
    console.log('  Admin:   admin@eduslide.com / admin123');
    console.log('  Faculty: faculty@eduslide.com / faculty123');
    console.log('  Student: student@eduslide.com / student123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
