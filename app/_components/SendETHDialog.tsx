'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from 'ethers';
import { useSession } from "next-auth/react";
import { useRecoilValue } from "recoil";
import { selectedAccountState } from "@/store/state";
import { getWallets } from '@/utils/indexedDB';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SendETHDialog() {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { data: session } = useSession();
    const selectedAccount = useRecoilValue(selectedAccountState);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSend = async () => {
        if (!session?.user?.email || !selectedAccount) {
            setError('User not authenticated or no account selected');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const wallets = await getWallets(session.user.uid);
            if (!wallets) {
                throw new Error('No wallets found');
            }

            const account = wallets.accounts.find(acc => acc.id === selectedAccount.id.toString());

            if (!account) {
                throw new Error('Selected account not found');
            }

            const privateKey = account.ethPrivateKey;

            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_URL);
            const wallet = new ethers.Wallet(privateKey, provider);

            const tx = await wallet.sendTransaction({
                to: recipient,
                value: ethers.parseEther(amount)
            });

            console.log('Transaction sent:', tx.hash);
            await tx.wait();
            console.log('Transaction confirmed');

            setAmount('');
            setRecipient('');
            setIsDialogOpen(false);
        } catch (err: any) {
            console.error('Error sending ETH:', err);
            setError(err.message || 'An error occurred while sending the transaction')
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>Send ETH</Button>
            </DialogTrigger>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>Send ETH</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="amount">
                            Amount
                        </label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="recipient">
                            Recipient
                        </label>
                        <Input
                            id="recipient"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <Button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send'}
                </Button>
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </DialogContent>
        </Dialog>
    );
}