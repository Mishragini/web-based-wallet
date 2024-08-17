import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";

const solanaNetwork = "https://solana-mainnet.g.alchemy.com/v2/3ZSds_AnK6e0uozHfCDJbwDSRHOtAkrm";
const ethereumNetwork = "https://eth-mainnet.g.alchemy.com/v2/3ZSds_AnK6e0uozHfCDJbwDSRHOtAkrm";

const solanaConnection = new Connection(solanaNetwork);

export async function getSOLBalance(publicKey: string) {
    try {
        const balance = await solanaConnection.getBalance(new PublicKey(publicKey));

        return balance / 1e9;
    } catch (err) {
        console.error('Error fetching SOL balance:', err);
        return 0;
    }
}

const ethProvider = new ethers.JsonRpcProvider(ethereumNetwork);

export async function getETHBalance(address: string) {
    try {
        const balance = await ethProvider.getBalance(address);

        return ethers.formatEther(balance);
    } catch (err) {
        console.error('Error fetching ETH balance:', err);
        return "0.00";
    }
}
