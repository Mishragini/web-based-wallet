import { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./db";
import { generateMnemonic, genETHWallet, genSOLWallet } from "./generateWallet";

export interface CustomSession extends Session {
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

export const authConfig: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET || 'secr3t',
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    callbacks: {
        session: ({ session, token }: any): CustomSession => {
            const customSession = session as CustomSession;
            if (customSession.user && token.uid) {
                customSession.user.uid = token.uid ?? "";
            }

            if (token.mnemonic && token.wallets) {
                customSession.mnemonic = token.mnemonic;
                customSession.wallets = token.wallets;
            }
            return customSession;
        },

        async jwt({ token, account, user }: any) {
            try {
                if (account?.provider === "google") {
                    const userEmail = user.email;

                    let userDb = await prisma.user.findUnique({
                        where: { email: userEmail }
                    });

                    if (!userDb) {
                        const mnemonic = generateMnemonic();
                        const solWallet = await genSOLWallet(mnemonic, 0);
                        const ethWallet = await genETHWallet(mnemonic, 0);

                        userDb = await prisma.user.create({
                            data: {
                                email: userEmail,
                                username: userEmail,
                                accounts: {
                                    create: {
                                        name: `Account 1`,
                                        solWallet: {
                                            create: { publicKey: solWallet.publicKey.toString() }
                                        },
                                        ethWallet: {
                                            create: { publicKey: ethWallet.address }
                                        }
                                    }
                                }
                            }
                        });

                        const account = await prisma.account.findFirst({
                            where: {
                                userId: userDb.id
                            }
                        });

                        token.mnemonic = mnemonic;
                        token.wallets = [{
                            id: account?.id,
                            ethPrivateKey: ethWallet.privateKey,
                            solPrivateKey: Buffer.from(solWallet.secretKey).toString('hex')
                        }];
                    }

                    token.uid = userDb.id;
                }
            } catch (error) {
                console.error('Error in jwt callback:', error);
                throw new Error("JWT callback error");
            }
            return token;
        }

    }
};
