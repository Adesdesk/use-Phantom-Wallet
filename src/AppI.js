// // Import necessary modules and dependencies
// import './App.css';
// import { sendAndConfirmTransaction, SystemProgram, Keypair, PublicKey, Transaction, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { useEffect, useState } from "react";
// import * as buffer from "buffer";
// window.Buffer = buffer.Buffer;

// // Define types
// const DisplayEncoding = "utf8" | "hex";

// const PhantomEvent = "disconnect" | "connect" | "accountChanged";
// const PhantomRequestMethod = "connect" | "disconnect" | "signTransaction" | "signAllTransactions" | "signMessage";

// // Define a provider interface to store the Phantom Provider
// const getProvider = () => {
//   if ("phantom" in window) {
//     const provider = window.phantom?.solana;
//     if (provider?.isPhantom) return provider;
//   }
// };

// export default function WalletsInteraction() {
//   const [provider, setProvider] = useState(undefined);
//   const [walletKey, setWalletKey] = useState(undefined);
//   const [walletBalance, setWalletBalance] = useState(undefined);
//   const [airdropped, setAirdropped] = useState(false);
//   const [transferStatus, setTransferStatus] = useState(false);
//   const [userWallet, setUserWallet] = useState(undefined);
//   const [userPrivateKey, setUserPrivateKey] = useState(undefined);
//   const [userWalletBalance, setUserWalletBalance] = useState(undefined);

//   useEffect(() => {
//     const provider = getProvider();

//     if (provider) setProvider(provider);
//     else setProvider(undefined);
//   }, []);

//   const connectWallet = async () => {
//     const { solana } = window;

//     if (solana) {
//       try {
//         const response = await solana.connect();
//         console.log('wallet account ', response.publicKey.toString());

//         setWalletKey(response.publicKey.toString());

//         const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

//         const walletBalance = await connection.getBalance(new PublicKey(response.publicKey.toString()));
//         setWalletBalance(walletBalance);
//       } catch (err) {
//         const errorCode = { code: 4001, message: 'User rejected the request.' };
//         console.log(errorCode, err);
//       }
//     }
//   };

//   const disconnectWallet = async () => {
//     const { solana } = window;
//     if (solana) {
//       try {
//         await solana.disconnect();
//         setWalletKey(undefined);
//       } catch (err) {
//         // Handle error
//       }
//     }
//   };

//   const createWallet = () => {
//     const { solana } = window;
//     if (solana) {
//       try {
//         const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//         const newPair = new Keypair();
//         const publicKey = new PublicKey(newPair.publicKey).toString();
//         const privateKey = newPair.secretKey;

//         setUserWallet(publicKey);
//         setUserPrivateKey(privateKey);
//       } catch (err) {
//         // Handle error
//       }
//     }
//   };

//   const airdropSol = async () => {
//     const { solana } = window;
//     if (solana) {
//       try {
//         const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//         const myWallet = await Keypair.fromSecretKey(userPrivateKey);

//         console.log("Airdropping some SOL to my wallet!");
//         const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(userWallet), 2 * LAMPORTS_PER_SOL);
//         await connection.confirmTransaction(fromAirDropSignature);
//         setAirdropped(true);
//         userWalletBalance2();
//       } catch (err) {
//         // Handle error
//       }
//     }
//   };

//   const userWalletBalance2 = async () => {
//     const { solana } = window;
//     if (solana) {
//       const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//       const walletBalance = await connection.getBalance(new PublicKey(userWallet));
//       setUserWalletBalance(walletBalance);
//     }
//   };

//   const transferSol = async () => {
//     if (walletKey) {
//       const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
//       const from = Keypair.fromSecretKey(userPrivateKey);
//       const to = new PublicKey(walletKey);
//       const lamportsToSend = 1.9 * LAMPORTS_PER_SOL;

//       var transaction = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: from.publicKey,
//           toPubkey: to,
//           lamports: lamportsToSend,
//         })
//       );

//       var signature = await sendAndConfirmTransaction(connection, transaction, [from]);
//       const senderBalanceAfter = await connection.getBalance(from.publicKey);
//       setUserWalletBalance(senderBalanceAfter);
//       const receiverBalanceAfter = await connection.getBalance(to);
//       setWalletBalance(receiverBalanceAfter);
//       setTransferStatus(true);
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <div className="flexDiv">
//           <div className="innerDiv">
//             <h2> {!walletKey ? `Connect to Phantom Wallet` : `Connected to Phantom Wallet`}</h2>
//             {provider && !walletKey && (
//               <button className="button" onClick={connectWallet}>Connect Wallet</button>
//             )}
//             {provider && walletKey && (
//               <div>
//                 <p>Connected account:</p>
//                 <small>{walletKey}</small>
//                 <p>Balance:</p>
//                 <p>{walletBalance ? `${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL` : `0 SOL`}</p>
//               </div>
//             )}
//             {provider && walletKey && (
//               <div>
//                 <button className="button" onClick={disconnectWallet}>Disconnect</button>
//               </div>
//             )}
//             {!provider && (
//               <p>
//                 No provider found. Install{" "}
//                 <a href="https://phantom.app/">Phantom Browser extension</a>
//               </p>
//             )}
//           </div>
//           <div className="innerDiv">
//             {!userWallet && (
//               <div>
//                 <h2>Create New Wallet</h2>
//                 <button className="button" onClick={createWallet}>Create Wallet</button>
//               </div>
//             )}
//             {userWallet && !airdropped && (
//               <div>
//                 <h2>Airdrop To Wallet</h2>
//                 <small>{userWallet}</small>
//                 <br />
//                 <br />
//                 <button className="button" onClick={airdropSol}>Airdrop Sol</button>
//               </div>
//             )}
//             {airdropped && (
//               <div>
//                 <h2>Airdropped!!!</h2>
//                 <p>Airdrop successful</p>
//                 <p>Balance:</p>
//                 <p>{userWalletBalance ? `${parseInt(userWalletBalance) / LAMPORTS_PER_SOL} SOL` : `0`}</p>
//               </div>
//             )}
//             {userWallet && airdropped && (
//               <div>
//                 <p>Transfer Sol</p>
//                 <button className="button" onClick={transferSol}>Transfer</button>
//               </div>
//             )}
//             {transferStatus && (
//               <div>
//                 <h2>Transferred!!!</h2>
//                 <p>Transaction successful</p>
//                 <p>Sender Balance:</p>
//                 <p>{userWalletBalance ? `${parseInt(userWalletBalance) / LAMPORTS_PER_SOL} SOL` : `0`}</p>
//                 <p>Receiver Balance:</p>
//                 <p>{walletBalance ? `${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL` : `0`}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>
//     </div>
//   );
// }
