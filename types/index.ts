
export interface SolWallet {
    id: number;
    accountId: number;
    publicKey: string;
    createdAt: Date;
}

export interface EthWallet {
    id: number;
    accountId: number;
    publicKey: string;
    createdAt: Date;
}

export interface Account {
    id: number;
    userId: number;
    name: string;
    solWallet?: SolWallet | null;
    ethWallet?: EthWallet | null;
    createdAt: Date;
}
