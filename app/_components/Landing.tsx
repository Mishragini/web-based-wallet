"use client";
import { Button } from "@/components/ui/button";
import { CustomSession } from "@/utils/auth";
import { getMnemonic, saveWallets } from "@/utils/indexedDB";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MnemonicComp } from "./Mnemonic";
import Image from 'next/image';

export const Landing = () => {
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const { status, data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const customSession = session as CustomSession;

            if (customSession.mnemonic && customSession.wallets) {
                saveWallets(customSession.user.uid, customSession.mnemonic, customSession.wallets)
                    .then(() => {
                        setMnemonic(customSession.mnemonic!);
                    })
                    .catch(error => {
                        console.error("Failed to save wallets:", error);
                    });
            } else {
                getMnemonic(customSession.user.uid)
                    .then(fetchedMnemonic => {
                        setMnemonic(fetchedMnemonic);
                    })
                    .catch(error => {
                        console.error("Failed to fetch mnemonic:", error);
                    });
            }
        }
    }, [status, session]);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="py-6 px-4 sm:px-6 lg:px-8">
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-2" />
                        <span className="text-xl font-bold text-gray-800">CryptoWallet</span>
                    </div>
                    {status === "authenticated" && (
                        <Button
                            variant={"destructive"}
                            onClick={() => signOut()}
                            className="text-white px-4 py-2 rounded-md  transition-colors"
                        >
                            Logout
                        </Button>
                    )}
                </nav>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Secure Your Crypto
                    </h1>
                    <p className="mt-5 text-xl text-gray-500">
                        Manage your cryptocurrencies with ease and security.
                    </p>
                    {status === "authenticated" ? (
                        <Button
                            onClick={() => router.push('/dashboard')}
                            className="mt-8 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                        >
                            Go to Dashboard
                        </Button>
                    ) : (
                        <Button
                            onClick={() => signIn('google')}
                            className="mt-8 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                        >
                            Sign In with Google
                        </Button>
                    )}
                </div>
            </main>

            <footer className="py-6 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
                    <p>© 2024 CryptoWallet. All rights reserved.</p>
                </div>
            </footer>

            {mnemonic && <MnemonicComp mnemonic={mnemonic} />}
        </div>
    );
};