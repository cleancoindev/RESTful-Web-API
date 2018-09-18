// adding necessary packages
const express = require('express')
const app = express()
const SHA256 = require('crypto-js/sha256');
const level = require('level');

//To store Chain data..
const chainDB = './chaindata';
const db = level(chainDB, {valueEncoding: 'json'});

//To store key values..
const keyDB = './keydata';
const db2 = level(keyDB);

// array that holds the blocks
let chain = []

// array to view the entire chain when request is made
let blockChain = []

// for using json in http POST request
app.use(express.json())

// universal variable for better access
let b_height, b_body, b_time, b_previousBlockHash, b_hash;
// variable to hold endpoints
let endpoints = ("Welcome! Below are the endpoints that you can try."
+ "\n1. http://localhost:8000/block - To add new data.\n2. http://localhost:8000/(block height, ex: 0,1..) - To get block details." 
+ "\n3. http://localhost:8000/chain - To get the recent blocks in the chain.")

// block class for creating blocks
class Block{
    constructor(data){
           // get key from db2 
            db2.get('key', function(err, value){
                // checks if the chain has a genesis block or not
                if(!value){
                    b_height = 0,
                    b_body = "First block in the chain - Genesis block",
                    b_time = new Date().getTime().toString().slice(0,-3),
                    b_previousBlockHash = "";
                    b_hash = SHA256(JSON.stringify(b_body) + b_height + b_previousBlockHash + b_time).toString();
                    // putting key in db2
                    db2.put('key', b_height, function(err){
                        // putting block in db
                        db.put(b_height, {hash: b_hash, height: b_height, body: b_body, time:b_time, 
                            previousBlockHash: b_previousBlockHash}, function(err){
                        })
                    })
                    // calling addBlock function to add block to chain temporarily
                    addBlock(b_hash, b_height, b_body, b_time, b_previousBlockHash)
                }else{
                    // updating height based on recent block
                    b_height = parseInt(value)+1,
                    b_body = data,
                    b_time = new Date().getTime().toString().slice(0,-3),
                    // get last stored block from db
                    db.get(value, function(err, pHash){
                        b_previousBlockHash = pHash.hash;
                        b_hash = SHA256(JSON.stringify(b_body) + b_height + b_previousBlockHash + b_time).toString();
                        //putting key and block in db2, db respectively
                        db2.put('key', b_height, function(err){})
                        db.put(b_height, {hash: b_hash, height: b_height, body: b_body, time:b_time, 
                            previousBlockHash: b_previousBlockHash}, function(err){})
                        // calling addBlock function to add block to chain temporarily    
                        addBlock(b_hash, b_height, b_body, b_time, b_previousBlockHash)
                    })
                }
        })
    }
}  

// a function to add blocks to chain temporarily 
function addBlock(ha, he, b, t, pBlockHash){
        chain.push({"hash":ha, "height":he, "body":b, "time":t, "previousBlockhash":pBlockHash}) 
}

// a function to view entire chain
function Blockchain(value){
    blockChain.push(value)
}

// http GET request for knowing endpoints
app.get('/', (req, res) => {
    res.send(endpoints)
})

// http POST request for adding blocks
app.post('/block', (req,res) => {
    const block = {
        body: req.body.body
    }
    // checks if data is not empty
    if(!req.body.body){
        res.status(400).send("Please input a valid data!")
        return
    }
    // get key from db2 
    db2.get('key', function(err, value){
        // check if there is a genesis block
        if(!value){
            new Block(block.body)
            setTimeout(() => {new Block(block.body)}, 1000)
            
            setTimeout(() => {res.send(chain[chain.length-1])}, 2000)
        }else{
            // adding new block if there is a genesis block already present in the chain
            new Block(block.body)
            // simple timeout to manage asynchronous activity
            setTimeout(() => res.send(chain[chain.length-1]), 1000)
        }
    })
})

// http GET request for getting blocks
app.get('/block/:height', (req,res) => {
    // checks if the block is present in the chain
    db2.get('key', function(err, key){
        if(!key || req.params.height>parseInt(key)){
            res.status(400).send(`Block with height ${req.params.height} does not exist!`)
        }else{
            db.get(req.params.height, function(err, value){
                res.send(value)
            })
        }
    })
})

// http GET request to view recent blocks in the chain
app.get('/chain', (req, res) => {
    db2.get('key', function(err, key){
        if(!key){
            res.send("There is no data!")  
        }else{
            db.createKeyStream()
                .on('data', function (data) {
                    db.get(data, function(err, value){
                        Blockchain(value)
                    })
                })
            setTimeout(() => {
                res.send(blockChain)
                blockChain = []}, 2000)    
        }
    })
})

// listening on PORT 8000
app.listen(8000, () => {
    console.log('Listening on port 8000!')
})

