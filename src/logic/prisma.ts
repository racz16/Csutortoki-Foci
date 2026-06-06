import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as runtime from '@prisma/client/runtime/client';

export type TPrismaClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

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
