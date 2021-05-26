const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
let ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error(` You can not sign transactions from other wallets`);
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }
    isValid() {
        /* mined rewards don't have to be signed. Verifying that transaction is
        either signed or a valid mining operation reward. 
        */

        // probably too basic. Replace. v.00000001
       if(this.fromAddress === null) return true;

       if(!this.signature || this.signature.length === 0) {
           throw new Error('No signature in this transaction');
       }
       // verify signed with the correct key
       const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');

       return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, prevHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions ;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.prevHash + this.timestamp +
        JSON.stringify(this.transactions) + this.nonce).toString();
    }

    // proof of work/ mining
    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }

    hasValidTransactions() {
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
            return true;
        }
    }

} 

class BlockChain {
    constructor() {
        // array of blocks first block in chain Genesis block
        this.chain = [this.createGenesisBlock()]; 
        // Security - control difficulty of adding new blocks
        this.difficulty = 2; 
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock() {
        return new Block(' 01/01/2021', 'Genesis Block', '000');
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    /*
     can in fact give yourself more coins with the below, however in a p2p
     network this is ignored because of validation
    */
    minePendingTransactions(miningRewardAddress) {
        // IRL miners pick pending transactions not all. Too many pending to be feasible.
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash); 
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');

        this.chain.push(block);
        // reset pending transaction array and give miner reward
        this.pendingTransactions = [
            // from address set to null, bc none exists from rewards
            new Transaction(null, miningRewardAddress, this.miningReward)
        ]
    }
    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must contain to and from address');
        }

        if(!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAddress(address) {
        let balance = 100;
        
        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    console.log('trans.amount: ',trans.amount);
                    balance -= trans.amount;
                }
                if(trans.toAddress === address) {
                    console.log('trans.amount: ',trans.amount);
                    balance += trans.amount;
                }
            }
        }
        console.log('balance: ', balance)
        return balance;
    }
    isChainValid() {
        for( let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock)

            // check for proper block linking

            // is hash still valid
            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // current block points to a valid prevHash
            if(currentBlock.prevHash !== previousBlock.hash) {
                return false;
            }
        }
        // valid chain
        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
