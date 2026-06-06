import { Prisma, PrismaClient } from '@/generated/prisma';
import { DefaultArgs } from '@/generated/prisma/runtime/library';
import { PrismaPg } from '@prisma/adapter-pg';

export type TPrismaClient = Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

declare global {
    var prismaClient: PrismaClient;
}

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prismaClient = new PrismaClient({
        adapter: new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        }),
    });
} else {
    if (!global.prismaClient) {
        global.prismaClient = new PrismaClient({
            adapter: new PrismaPg({
                connectionString: process.env.DATABASE_URL,
            }),
        });
    }
    prismaClient = global.prismaClient;
}

export default prismaClient;
