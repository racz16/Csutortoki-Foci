import { PrismaClient } from '@/generated/prisma';

declare global {
    var prismaClient: PrismaClient;
}

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prismaClient = new PrismaClient();
} else {
    if (!global.prismaClient) {
        global.prismaClient = new PrismaClient();
    }
    prismaClient = global.prismaClient;
}

export default prismaClient;
