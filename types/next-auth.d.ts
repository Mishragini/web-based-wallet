// types/next-auth.d.ts
import NextAuth from "next-auth";
import { CustomSession } from "@/utils/auth"; // Adjust the path according to your file structure

declare module "next-auth" {
    interface Session {
        user: {
            email: string;
            name: string;
            image: string;
            uid: string; // Add uid here
        };
        mnemonic?: string;
        wallets?: Array<{
            id: string;
            ethPrivateKey: string;
            solPrivateKey: string;
        }>;
    }
}
