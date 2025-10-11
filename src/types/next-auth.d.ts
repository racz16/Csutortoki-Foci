import { Profile as DefaultProfile, DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        admin: boolean;
    }

    interface Profile extends DefaultProfile {
        // Reddit only field
        icon_img?: string;
    }
}
