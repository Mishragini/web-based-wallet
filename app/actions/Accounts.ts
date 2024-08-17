'use server';

import prisma from "@/utils/db";
import { genETHWallet, genSOLWallet } from "@/utils/generateWallet";
import { getMnemonic, saveWallets } from "@/utils/indexedDB";

export async function getAccounts(userEmail: string) {
    const accounts = await prisma.account.findMany({
        where: {
            user: {
                email: userEmail
            }
        },
        include: {
            solWallet: true,
            ethWallet: true
        }
    });

    return accounts;
}


export async function createNewAccount(userId: string, accountName: string, userEmail: string, mnemonic: string) {


    const accountCount = await prisma.account.count({
        where: { userId: parseInt(userId) },
    });
    const currentIndex = accountCount;

    const solWallet = await genSOLWallet(mnemonic, currentIndex);
    const ethWallet = await genETHWallet(mnemonic, currentIndex);

    const user = await prisma.user.findFirst({
        where: {
            email: userEmail
        }
    })

    const newAccount = await prisma.account.create({
        data: {
            userId: user?.id!,
            name: accountName,
            solWallet: {
                create: {
                    publicKey: solWallet.publicKey.toString(),
                },
            },
            ethWallet: {
                create: {
                    publicKey: ethWallet.address,
                },
            },
        },
        include: {
            solWallet: true,
            ethWallet: true,
        },
    });


    return {
        newAccount,
        ethPrivateKey: ethWallet.privateKey,
        solPrivateKey: Buffer.from(solWallet.secretKey).toString('hex')
    };
}
