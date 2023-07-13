import React, { useEffect, useState } from 'react';
import { PublicKey, Transaction, Keypair, SystemProgram, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

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

const getProvider = (): PhantomProvider | undefined => {
  if ('solana' in window) {
    const provider = (window as any).solana;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  const [walletKey, setWalletKey] = useState<string | undefined>(undefined);
  const [transactionStatus, setTransactionStatus] = useState<string | undefined>(undefined);

  const createAccount = async () => {
    try {
      const keypair = Keypair.generate();
      const publicKey = new PublicKey(keypair.publicKey.toString());

      setTransactionStatus('Processing...');

      // Airdrop 2 SOL to the new account
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const airdropSignature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL * 2);
      await connection.confirmTransaction(airdropSignature);

      console.log('New account created:', publicKey.toString());
      setWalletKey(publicKey.toString());
      setTransactionStatus('Success');
    } catch (err) {
      console.error('Error creating new account:', err);
      setTransactionStatus('Failed');
    }
  };

  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

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
      window.open('https://phantom.app/', '_blank');
    }
  };

  return (
    <div className="App">

      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={createAccount}
      >
        Create a new Solana account
      </button>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={connectWallet}
      >
        Connect to Phantom Wallet
      </button>

      {transactionStatus && (
        <div className="mt-4">
          Transaction Status: {transactionStatus}
        </div>
      )}
    </div>
  );
}

export default App;
