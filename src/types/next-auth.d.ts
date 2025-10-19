import { Profile as DefaultProfile, DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        admin: boolean;
        provider?: string;
    }

    interface Profile extends DefaultProfile {
        // Reddit only field
        icon_img?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        provider?: string;
    }
}
