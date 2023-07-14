import React, { useEffect, useState } from 'react';
import { Keypair, PublicKey, Transaction, Connection } from '@solana/web3.js';

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
        console.log('wallet account ', response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    } else {
      // Redirect to the extension installation link
      window.open('https://phantom.app/', '_blank');
    }
  };

  const createAccount = async () => {
    if (provider && provider.publicKey) {
      try {
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey;

        const connection = new Connection(
          'https://api.devnet.solana.com',
          'confirmed'
        );

        // Request an airdrop to the new account
        const airdropTx = await connection.requestAirdrop(
          publicKey,
          2 * 1000000000 // Airdrop 2 SOL (2 * 10^9 lamports)
        );
        setNotification('Processing transaction...');

        // Wait for the transaction to be confirmed
        await connection.confirmTransaction(airdropTx);

        setWalletKey(publicKey.toString());
        setNotification('Transaction successful!');
      } catch (err) {
        console.error('Transaction failed:', err);
        setNotification('Transaction failed!');
      }
    }
  };

  return (
    <div className="App">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={connectWallet}
      >
        Connect to Phantom Wallet
      </button>

      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={createAccount}
      >
        Create a new Solana account
      </button>

      <p>{walletKey}</p>
      <p>{notification}</p>
    </div>
  );
}

export default App;
