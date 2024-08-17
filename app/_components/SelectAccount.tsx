import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { selectedAccountState } from "@/store/state";
import { createNewAccount, getAccounts } from "../actions/Accounts";
import { getMnemonic, saveWallets } from "@/utils/indexedDB";

export const SelectAccount: React.FC = () => {
    const { data: session } = useSession();
    const email = session?.user?.email || "";
    const [selectedAccount, setSelectedAccount] = useRecoilState(selectedAccountState);
    const [accounts, setAccounts] = React.useState<any[]>([]);
    const [isCreating, setIsCreating] = React.useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (email) {
                const fetchedAccounts = await getAccounts(email);
                setAccounts(fetchedAccounts);
                if (fetchedAccounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(fetchedAccounts[0]);
                }
            }
        };
        fetchAccounts();
    }, [email, setSelectedAccount, selectedAccount]);

    const handleAddAccount = async () => {
        setIsCreating(true);
        try {
            const mnemonic = await getMnemonic(session?.user?.uid!);
            if (!mnemonic) {
                throw new Error('Mnemonic not found for the user');
            }
            const { newAccount, ethPrivateKey, solPrivateKey } = await createNewAccount(session?.user?.uid!, `Account ${accounts.length + 1}`, session?.user?.email!, mnemonic);
            await saveWallets(session?.user?.uid!, mnemonic, [
                {
                    id: newAccount.id.toString(),
                    ethPrivateKey,
                    solPrivateKey,
                },
            ]);
            setAccounts([...accounts, newAccount]);
            setSelectedAccount(newAccount);
        } catch (error) {
            console.error("Error creating new account:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Accounts</h2>
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className={`p-3 mb-2 rounded-md cursor-pointer transition-colors duration-150 ease-in-out ${selectedAccount?.id === account.id
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                    >
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-gray-500 truncate">ETH: {account.ethWallet.publicKey}</p>
                        <p className="text-xs text-gray-500 truncate">SOL: {account.solWallet.publicKey}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <button
                    onClick={handleAddAccount}
                    disabled={isCreating}
                    className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? 'Creating...' : 'Add Account'}
                </button>
            </div>
        </div>
    );
};