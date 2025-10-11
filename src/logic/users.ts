import { prismaClient } from './prisma';

export async function isUserAdmin(email: string): Promise<boolean> {
    const user = await prismaClient.user.findFirst({
        where: { email },
        omit: { email: true, id: true },
    });
    return user?.admin ?? false;
}
