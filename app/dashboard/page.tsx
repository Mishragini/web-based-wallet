"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { selectedAccountState } from "@/store/state";
import { SelectAccount } from "../_components/SelectAccount";
import { getAccounts } from "../actions/Accounts";
import { getETHBalance, getSOLBalance } from "../actions/Balance";

export default function Page() {
    const { data: session } = useSession();
    const [selectedAccount, setSelectedAccount] = useRecoilState(selectedAccountState);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [ethBalance, setEthBalance] = useState<string>("0.00");
    const [solBalance, setSolBalance] = useState<string>("0.00");

    useEffect(() => {
        const fetchAccounts = async () => {
            if (session?.user?.email) {
                const fetchedAccounts = await getAccounts(session.user.email);
                setAccounts(fetchedAccounts);
            }
        };
        fetchAccounts();
    }, [session]);

    useEffect(() => {
        const fetchBalances = async () => {
            if (selectedAccount) {
                if (selectedAccount.ethWallet?.publicKey) {
                    const ethBal = await getETHBalance(selectedAccount.ethWallet.publicKey);
                    setEthBalance(ethBal);
                }

                if (selectedAccount.solWallet?.publicKey) {
                    const solBal = await getSOLBalance(selectedAccount.solWallet.publicKey);
                    setSolBalance(solBal.toFixed(2)); // Format to 2 decimal places
                }
            }
        };
        fetchBalances();
    }, [selectedAccount]);

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-80 bg-white shadow-md flex flex-col">
                <div className="p-4 flex-grow overflow-y-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">My Wallet</h1>
                    <SelectAccount />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h2>

                {selectedAccount ? (
                    <div>
                        <h3 className="text-xl font-medium text-gray-700 mb-4">
                            {selectedAccount.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Ethereum Wallet</h4>
                                <p className="text-sm text-gray-600 mb-2">Public Address:</p>
                                <p className="text-xs bg-gray-100 p-2 rounded mb-4 break-all">
                                    {selectedAccount?.ethWallet?.publicKey}
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                    Balance: <span className="text-green-600">{ethBalance} ETH</span>
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Solana Wallet</h4>
                                <p className="text-sm text-gray-600 mb-2">Public Address:</p>
                                <p className="text-xs bg-gray-100 p-2 rounded mb-4 break-all">
                                    {selectedAccount?.solWallet?.publicKey}
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                    Balance: <span className="text-green-600">{solBalance} SOL</span>
                                </p>
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
    );
}
