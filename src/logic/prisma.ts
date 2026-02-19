import { Prisma, PrismaClient } from '@/generated/prisma';
import { DefaultArgs } from '@/generated/prisma/runtime/library';

export type TPrismaClient = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

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
