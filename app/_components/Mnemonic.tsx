import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export const MnemonicComp = ({ mnemonic }: { mnemonic: string }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const router = useRouter();

    const words = mnemonic.split(" ");

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(e.target.checked);
    };

    const handleGoToDashboard = () => {
        if (isChecked) {
            router.push("/dashboard");
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-gray-900">Save Your Mnemonic Phrase</DialogTitle>
                </DialogHeader>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {words.map((word, index) => (
                            <div
                                key={index}
                                className="bg-white border border-yellow-200 rounded p-2 text-center font-mono text-sm"
                            >
                                <span className="text-yellow-600 mr-1">{index + 1}.</span>{word}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-yellow-700">Write these words down on paper and keep them in a secure location.</p>
                </div>
                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="saveMnemonic"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="saveMnemonic" className="ml-2 block text-sm text-gray-900">
                        I have saved my mnemonic phrase securely
                    </label>
                </div>
                <button
                    onClick={handleGoToDashboard}
                    disabled={!isChecked}
                    className={`mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isChecked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                    Go to Dashboard
                </button>
            </DialogContent>
        </Dialog>
    );
};
