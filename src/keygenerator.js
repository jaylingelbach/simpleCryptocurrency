const EC = require('elliptic').ec;
// Create and initialize EC context
let ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log(`public key: ${publicKey} and private key: ${privateKey}`)
