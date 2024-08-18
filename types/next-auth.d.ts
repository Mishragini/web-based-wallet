import NextAuth from "next-auth";
import { CustomSession } from "@/utils/auth";

declare module "next-auth" {
    interface Session {
        user: {
            email: string;
            name: string;
            image: string;
            uid: string;
        };
        mnemonic?: string;
        wallets?: Array<{
            id: string;
            ethPrivateKey: string;
            solPrivateKey: string;
        }>;
    }
}
