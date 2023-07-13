import { generateSolanaAccount } from "./utils/Solana.js";
import React, { useState } from "react";
import { WalletAdapterPhantom } from "@solana/wallet-adapter-phantom";


function SolanaButton() {
  const [status, setStatus] = useState(null); // State to manage the status notifications

  const handleConnectPhantom = async () => {
    setStatus("Processing...");
    if (typeof window.solana !== "undefined") {
      try {
        await window.solana.connect();
        setStatus("Connected to Phantom Wallet");
        
      } catch (error) {
        setStatus("Error connecting to Phantom Wallet");
        console.error("Error connecting to Phantom Wallet:", error);
      }
    } else {
      setStatus("Phantom Wallet extension not found");
      window.open("https://phantom.app/", "_blank");
    }
  };

  const handleCreateAccount = async () => {
    setStatus("Processing...");
    try {
      const account = await generateSolanaAccount();
      setStatus("New account created");
      console.log("New account created:", account);
      // 
    } catch (error) {
      setStatus("Error creating Solana account");
      console.error("Error creating Solana account:", error);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      {status && (
        <div
          className={`${
            status.includes("Error") ? "bg-red-500" : "bg-green-500"
          } text-white font-bold py-2 px-4 rounded mb-4`}
        >
          {status}
        </div>
      )}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={handleConnectPhantom}
      >
        Connect to Phantom Wallet
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleCreateAccount}
      >
        Create a new Solana account
      </button>
    </div>
  );
}

export default SolanaButton;