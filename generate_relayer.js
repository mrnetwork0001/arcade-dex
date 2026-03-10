// Temporary relayer generator
import { Wallet } from 'ethers';

const w = Wallet.createRandom();
console.log("Address:", w.address);
console.log("PrivateKey:", w.privateKey);
