import { prismaClient } from '@/logic/prisma';
import NextAuth, { AuthOptions, Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import AzureAdProvider from 'next-auth/providers/azure-ad';
import DiscordProvider from 'next-auth/providers/discord';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import RedditProvider from 'next-auth/providers/reddit';

const authOptions: AuthOptions = {
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
        async session({ session, token }: { session: Session; token: JWT; user: AdapterUser }): Promise<Session> {
            const user = await prismaClient.user.findFirst({
                where: { email: session.user?.email ?? '' },
                omit: { email: true, id: true },
            });
            if (session.user && !session.user.image) {
                session.user.image = token.picture;
            }
            return { ...session, admin: user?.admin ?? false };
        },
        async jwt({ token, profile, account }) {
            if (account?.provider === 'reddit' && !token.picture && profile?.icon_img) {
                token.picture = profile.icon_img;
            }
            return token;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
