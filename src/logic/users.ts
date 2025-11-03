import { AuthOptions, Session } from 'next-auth';
import AzureAdProvider from 'next-auth/providers/azure-ad';
import DiscordProvider from 'next-auth/providers/discord';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import RedditProvider from 'next-auth/providers/reddit';
import prismaClient from './prisma';

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        AzureAdProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
        }),
        RedditProvider({
            clientId: process.env.REDDIT_CLIENT_ID!,
            clientSecret: process.env.REDDIT_CLIENT_SECRET!,
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    pages: { signIn: '/sign-in' },
    callbacks: {
        async session({ session, token }): Promise<Session> {
            const admin = session.user?.email ? await isUserAdmin(session.user.email) : false;
            if (session.user && !session.user.image) {
                session.user.image = token.picture;
            }
            session.provider = token.provider;
            return { ...session, admin };
        },
        async jwt({ token, profile, account }) {
            if (account?.provider === 'reddit' && !token.picture && profile?.icon_img) {
                token.picture = profile.icon_img;
            }
            if (account?.provider && !token.provider) {
                token.provider = getProviderName(account.provider);
            }
            return token;
        },
    },
};

function getProviderName(providerId: string): string {
    switch (providerId) {
        case 'google':
            return 'Google';
        case 'azure-ad':
            return 'Microsoft';
        case 'reddit':
            return 'Reddit';
        case 'discord':
            return 'Discord';
        case 'github':
            return 'GitHub';
        default:
            return providerId;
    }
}

export async function isUserAdmin(email: string): Promise<boolean> {
    const user = await prismaClient.user.findFirst({
        where: { email },
        omit: { email: true, id: true },
    });
    return user?.admin ?? false;
}
