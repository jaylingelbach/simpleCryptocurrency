const { BlockChain, Transaction } = require('./blockchain.js');
const EC = require('elliptic').ec;
let ec = new EC('secp256k1');
const dotenv = require('dotenv');

// init env vars
dotenv.config();


let kittycoins = new BlockChain();

// Easy to reuse fake keys for testing
let publicKey = process.env.DD_PUB_KEY;
let privateKey = process.env.DD_PRIVATE_KEY 

const myKey = ec.keyFromPrivate(publicKey);
const myWalletAddress = myKey.getPublic('hex');

// in real use you'd want the other addy's public key, but testing so.... meh
const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
kittycoins.addTransaction(tx1);


// IRL addresses are public keys of someones wallet (basic version before keys added)
// kittycoins.createTransaction(new Transaction('addy1', 'addy2', 100));
// kittycoins.createTransaction(new Transaction('addy2', 'addy1', 50));

// after this will be pending so have to start the miner to create a block and
// store it in the chain.

console.log('\n Starting mining operations...');
kittycoins.minePendingTransactions(myWalletAddress);

// console.log('\n Starting mining operations again...');
// kittycoins.minePendingTransactions('fake-address');
console.log('Balance of jay is: ', 
kittycoins.getBalanceOfAddress(myWalletAddress));
