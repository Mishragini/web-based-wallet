import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";


const solanaURL = process.env.NEXT_PUBLIC_SOLANA_URL!;
const ethereumURL = process.env.NEXT_PUBLIC_ETHEREUM_URL!;

const solanaConnection = new Connection(solanaURL);

export async function getSOLBalance(publicKey: string) {
    try {
        const balance = await solanaConnection.getBalance(new PublicKey(publicKey));

        return balance / 1e9;
    } catch (err) {
        console.error('Error fetching SOL balance:', err);
        return 0;
    }
}

const ethProvider = new ethers.JsonRpcProvider(ethereumURL);

export async function getETHBalance(address: string) {
    try {
        const balance = await ethProvider.getBalance(address);

        return ethers.formatEther(balance);
    } catch (err) {
        console.error('Error fetching ETH balance:', err);
        return "0.00";
    }
}
