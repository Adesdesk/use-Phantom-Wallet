import React, { useEffect, useState } from 'react';
import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
  AccountInfo,
} from '@solana/web3.js';
import * as buffer from 'buffer';

window.Buffer = buffer.Buffer;

type DisplayEncoding = 'utf8' | 'hex';

type PhantomEvent = 'disconnect' | 'connect' | 'accountChanged';
type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
  const [walletKey, setWalletKey] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string>('');
  const [senderAccount, setSenderAccount] = useState<Keypair | undefined>(undefined);
  const [senderBalance, setSenderBalance] = useState<number | undefined>(undefined);
  const [receiverBalance, setReceiverBalance] = useState<number | undefined>(undefined);

  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  const getProvider = (): PhantomProvider | undefined => {
    if ('solana' in window) {
      const provider = (window as any).solana;
      if (provider.isPhantom) return provider as PhantomProvider;
    }
    return undefined;
  };

  const connectWallet = async () => {
    if (window.solana) {
      try {
        const response = await (window as any).solana.connect();
        console.log('wallet account', response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
        await fetchAccountBalances();
      } catch (err) {
        
      }
    } else {
      // Redirect to the extension installation link
      window.open('https://phantom.app/', '_blank');
    }
  };

  const createAccount = async () => {
    try {
      const senderAccount = Keypair.generate(); // Generate a keypair for the sender's account
      const publicKey = senderAccount.publicKey.toString();

      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

      // Request an airdrop to the sender's account
      const airdropTx = await connection.requestAirdrop(
        senderAccount.publicKey,
        2 * 1000000000 // Airdrop 2 SOL (2 * 10^9 lamports)
      );
      setNotification('Processing transaction...');

      // Wait for the transaction to be confirmed
      await connection.confirmTransaction(airdropTx);

      setWalletKey(publicKey);
      setNotification('Transaction successful!');
      setSenderAccount(senderAccount); // Store the sender's account keypair
      await fetchAccountBalances();
    } catch (err) {
      console.error('Transaction failed:', err);
      setNotification('Transaction failed!');
    }
  };

  const transferToNewWallet = async () => {
    if (provider && provider.publicKey && walletKey && senderAccount) {
      try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: senderAccount.publicKey,
            toPubkey: new PublicKey(walletKey),
            
            // Transferring 1.98 SOL as approximately 2 SOL to provide for transaction fees
            lamports: 1.98 * 1000000000, // 1.98 SOL (10^9 lamports)
          })
        );

        const signature = await connection.sendTransaction(transaction, [senderAccount]);
        setNotification('Processing transaction...');

        await connection.confirmTransaction(signature);

        setNotification('Transfer successful!');
        await fetchAccountBalances();
      } catch (err) {
        console.error('Transfer failed:', err);
        setNotification('Transfer failed!');
      }
    }
  };

  const fetchAccountBalances = async () => {
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const senderAccountInfo: AccountInfo<Buffer> | null = await connection.getAccountInfo(
        new PublicKey(senderAccount?.publicKey.toString() || '')
      );
      const receiverAccountInfo: AccountInfo<Buffer> | null = await connection.getAccountInfo(
        new PublicKey(walletKey || '')
      );

      if (senderAccountInfo) {
        const senderLamports = senderAccountInfo.lamports;
        const senderSol = senderLamports / 1000000000;
        setSenderBalance(senderSol);
      }

      if (receiverAccountInfo) {
        const receiverLamports = receiverAccountInfo.lamports;
        const receiverSol = receiverLamports / 1000000000;
        setReceiverBalance(receiverSol);
      }
    } catch (err) {
      console.error('Failed to fetch account balances:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-300">
      <h3 className="text-2xl text-white text-center font-bold rounded-md mb-2">
        Interaction between Solana wallets by Adeola
      </h3>

      <button
        className="bg-yellow-900 hover:bg-yellow-800 text-white font-bold py-2 mt-10 shadow-lg px-4 rounded"
        onClick={createAccount}
      >
        Create a new Solana account
      </button>

      <button
        className="bg-red-700 hover:bg-red-600 text-white font-bold mt-5 shadow-lg py-2 px-4 rounded"
        onClick={connectWallet}
      >
        Connect to Phantom Wallet
      </button>

      <button
        className="bg-yellow-900 hover:bg-yellow-800 text-white font-bold mt-5 py-2 shadow-lg px-4 rounded"
        onClick={transferToNewWallet}
      >
        Transfer to new wallet
      </button>

      <p className="text-red-700 font-bold">Connected Phantom Wallet Key: {walletKey}</p>
      <p className="text-red-700 font-bold">Sender Balance: {senderBalance} SOL</p>
      <p className="text-red-700 font-bold">Receiver Balance: {receiverBalance} SOL</p>
      <p className="text-red-700 font-bold">{notification}</p>
    </div>
  );
}

export default App;
