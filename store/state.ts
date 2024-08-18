
import { Account } from "@/types";
import { atom } from "recoil";

export const selectedAccountState = atom<Account | null>({
    key: 'selectedAccountState',
    default: null,
});
