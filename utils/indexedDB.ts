import { openDB } from 'idb';
import CryptoJS from 'crypto-js';

const DB_NAME = 'walletDB';
const STORE_NAME = 'wallets';
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'your-secret-key';

export const initDB = async () => {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        },
    });
    return db;
};

const encrypt = (text: string) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
const decrypt = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const saveWallets = async (userId: string, mnemonic: string, accounts: { id: string; ethPrivateKey: string; solPrivateKey: string }[]) => {
    const db = await initDB();
    const encryptedMnemonic = encrypt(mnemonic);
    await db.put(STORE_NAME, { id: userId, mnemonic: encryptedMnemonic });

    for (const account of accounts) {
        const encryptedData = {
            ethPrivateKey: encrypt(account.ethPrivateKey),
            solPrivateKey: encrypt(account.solPrivateKey)
        };
        await db.put(STORE_NAME, { id: `${userId}-${account.id}`, ...encryptedData });
    }
};

export const getWallets = async (userId: string) => {
    const db = await initDB();
    const userData = await db.get(STORE_NAME, userId);
    if (!userData) return null;

    const mnemonic = decrypt(userData.mnemonic);
    const accounts = [];

    const accountKeys = await db.getAllKeys(STORE_NAME);
    for (const key of accountKeys) {
        if (typeof key === 'string' && key.startsWith(`${userId}-`)) {
            const accountData = await db.get(STORE_NAME, key);
            if (accountData) {
                accounts.push({
                    id: key.split('-')[1],
                    ethPrivateKey: decrypt(accountData.ethPrivateKey),
                    solPrivateKey: decrypt(accountData.solPrivateKey)
                });
            }
        }
    }

    return { mnemonic, accounts };
};

export const getMnemonic = async (userId: string): Promise<string | null> => {
    const db = await initDB();
    const userData = await db.get(STORE_NAME, userId);
    if (userData) {
        return decrypt(userData.mnemonic);
    }
    return null;
};


export const deleteWallets = async (userId: string) => {
    const db = await initDB();
    const accountKeys = await db.getAllKeys(STORE_NAME);
    for (const key of accountKeys) {
        if (typeof key === 'string' && key.startsWith(userId)) {
            await db.delete(STORE_NAME, key);
        }
    }
};
