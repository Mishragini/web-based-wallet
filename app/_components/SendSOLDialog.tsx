"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from 'next-auth/react';
import { getWallets } from '@/utils/indexedDB';
import { useRecoilValue } from 'recoil';
import { selectedAccountState } from '@/store/state';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SendSOLDialog() {
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { data: session } = useSession();
    const selectedAccount = useRecoilValue(selectedAccountState);

    const handleSend = async () => {
        if (!session?.user?.email || !selectedAccount) {
            setError('User not authenticated or no account selected');
            return;
        }
        setIsLoading(true);
        setError('');

        const MAX_RETRIES = 3;
        const BASE_DELAY = 1000;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const wallets = await getWallets(session.user.uid);
                if (!wallets) {
                    throw new Error('No wallets found');
                }

                const account = wallets.accounts.find(acc => acc.id === selectedAccount.id.toString());

                if (!account) {
                    throw new Error('Selected account not found');
                }

                const privateKey = account.solPrivateKey;

                const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));

                const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_URL!);

                const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: keypair.publicKey,
                        toPubkey: new PublicKey(recipient),
                        lamports: parseFloat(amount) * LAMPORTS_PER_SOL
                    })
                );

                const signature = await sendAndConfirmTransaction(
                    connection,
                    transaction,
                    [keypair],
                    { commitment: 'confirmed' }
                );

                console.log(`Transaction confirmed. Signature: ${signature}`);
                setAmount('');
                setRecipient('');
                setIsDialogOpen(false);
                setIsLoading(false);
                return;

            } catch (error: any) {
                console.error('Error sending transaction:', error);
                if (error.message.includes('429') || error.message.includes('rate-limited')) {
                    const delay = BASE_DELAY * Math.pow(2, attempt);
                    console.log(`Rate limited. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    setError(error.message || 'An error occurred while sending the transaction');
                    setIsLoading(false);
                    return;
                }
            }
        }

        setError('Failed to send transaction after multiple attempts. The network may be congested.');
        setIsLoading(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>Send SOL</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send SOL</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="amount" >
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
                        <label htmlFor="recipient" >
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