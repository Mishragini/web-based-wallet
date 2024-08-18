"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { selectedAccountState } from "@/store/state";
import { SelectAccount } from "../_components/SelectAccount";
import { getAccounts } from "../actions/Accounts";
import { getETHBalance, getSOLBalance } from "../actions/Balance";
import { SendETHDialog } from "../_components/SendETHDialog";
import { SendSOLDialog } from "../_components/SendSOLDialog";
import { MobileSidebar } from "../_components/MobileSidebar";
import { Loading } from "../_components/Loading";

export default function Page() {
    const { data: session } = useSession();
    const [selectedAccount, setSelectedAccount] = useRecoilState(selectedAccountState);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [ethBalance, setEthBalance] = useState<string>("0.00");
    const [solBalance, setSolBalance] = useState<string>("0.00");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingBalances, setLoadingBalances] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (session?.user?.email) {
                try {
                    const fetchedAccounts = await getAccounts(session.user.email);
                    setAccounts(fetchedAccounts);
                    if (fetchedAccounts.length > 0 && !selectedAccount) {
                        setSelectedAccount(fetchedAccounts[0]);
                    }
                } catch (error) {
                    console.error("Error fetching accounts:", error);
                } finally {
                    setLoadingAccounts(false); // Stop loading accounts once fetched
                }
            }
        };
        fetchAccounts();
    }, [session, selectedAccount, setSelectedAccount]);

    useEffect(() => {
        const fetchBalances = async () => {
            if (selectedAccount) {
                setLoadingBalances(true);
                try {
                    if (selectedAccount.ethWallet?.publicKey) {
                        const ethBal = await getETHBalance(selectedAccount.ethWallet.publicKey);
                        setEthBalance(ethBal);
                    }

                    if (selectedAccount.solWallet?.publicKey) {
                        const solBal = await getSOLBalance(selectedAccount.solWallet.publicKey);
                        setSolBalance(solBal.toFixed(2));
                    }
                } catch (error) {
                    console.error("Error fetching balances:", error);
                } finally {
                    setLoadingBalances(false);
                }
            } else {
                setLoadingBalances(false);
            }
        };
        fetchBalances();
    }, [selectedAccount]);

    const isLoading = loadingAccounts || loadingBalances;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="hidden md:block w-80 bg-white shadow-md flex-shrink-0">
                <div className="p-4 h-full overflow-y-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">My Wallet</h1>
                    <SelectAccount />
                </div>
            </div>

            <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

            <div className="flex-1 overflow-y-auto">
                <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>
                    <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="text-gray-600 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h2>

                    {selectedAccount ? (
                        <div>
                            <h3 className="text-xl font-medium text-gray-700 mb-4">
                                {selectedAccount.name}
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Ethereum Wallet</h4>
                                    <p className="text-sm text-gray-600 mb-2">Public Address:</p>
                                    <p className="text-xs bg-gray-100 p-2 rounded mb-4 break-all">
                                        {selectedAccount?.ethWallet?.publicKey}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-800">
                                            Balance: <span className="text-green-600">{ethBalance} ETH</span>
                                        </p>
                                        <SendETHDialog />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Solana Wallet</h4>
                                    <p className="text-sm text-gray-600 mb-2">Public Address:</p>
                                    <p className="text-xs bg-gray-100 p-2 rounded mb-4 break-all">
                                        {selectedAccount?.solWallet?.publicKey}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-800">
                                            Balance: <span className="text-green-600">{solBalance} SOL</span>
                                        </p>
                                        <SendSOLDialog />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">Select an account to view details.</p>
                    )}

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-gray-600">No recent transactions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
