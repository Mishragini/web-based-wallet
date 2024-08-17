import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Wallet } from 'ethers';
import { HDNodeWallet } from 'ethers';
import nacl from 'tweetnacl';

export const generateMnemonic = (): string => {
    return bip39.generateMnemonic();
};

export async function genSOLWallet(mnemonic: string, currentIndex: number) {
    const seed = await bip39.mnemonicToSeed(mnemonic);

    const seedHex = seed.toString('hex');

    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seedHex).key;

    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

    const newKeypair = Keypair.fromSecretKey(secret);

    return newKeypair;
}

export async function genETHWallet(mnemonic: string, currentIndex: number) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const newWallet = new Wallet(privateKey);

    return newWallet;
}