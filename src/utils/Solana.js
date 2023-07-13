import { Keypair, Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

export async function generateSolanaAccount() {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();

  // Airdrop 2 SOL to the new account
  await connection.requestAirdrop(new PublicKey(publicKey), 2 * 1000000000);

  return {
    publicKey,
    secretKey: keypair.secretKey.toString(),
  };
}

export async function transferSOL(fromSecretKey, toPublicKey) {
  const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromSecretKey, "base64"));

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: 2 * 1000000000, // 2 SOL
    })
  );

  const signature = await connection.sendTransaction(transaction, [fromKeypair]);
  await connection.confirmTransaction(signature);
  return signature;
}
