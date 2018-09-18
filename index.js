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

// for using json in http POST request
app.use(express.json())

// universal variable for better access
let height, body, time, previousBlockHash, hash;

// block class for creating blocks
class Block{
    constructor(data){
           // get key from db2 
            db2.get('key', function(err, value){
                // checks if the chain has a genesis block or not
                if(!value){
                    height = 0,
                    body = "Genesis Block",
                    time = new Date().getTime().toString().slice(0,-3),
                    previousBlockHash = "";
                    hash = SHA256(JSON.stringify(body) + height + previousBlockHash + time).toString();
                    // putting key in db2
                    db2.put('key', height, function(err){
                        // putting block in db
                        db.put(height, {Block_height: height, Block_body: body, Block_time:time, 
                            Block_previousBlockHash: previousBlockHash, Block_hash: hash}, function(err){
                        })
                    })
                    // calling addBlock function to add block to chain temporarily
                    addBlock(height, body, time, previousBlockHash, hash)
                }else{
                    // updating height based on recent block
                    height = parseInt(value)+1,
                    body = data,
                    time = new Date().getTime().toString().slice(0,-3),
                    // get last stored block from db
                    db.get(value, function(err, pHash){
                        previousBlockHash = pHash.Block_hash;
                        hash = SHA256(JSON.stringify(body) + height + previousBlockHash + time).toString();
                        //putting key and block in db2, db respectively
                        db2.put('key', height, function(err){})
                        db.put(height, {Block_height: height, Block_body: body, Block_time:time, 
                            Block_previousBlockHash: previousBlockHash, Block_hash: hash}, function(err){})
                        // calling addBlock function to add block to chain temporarily    
                        addBlock(height, body, time, previousBlockHash, hash)
                    })
                }
        })
    }
}  

// a function to add blocks to chain temporarily 
function addBlock(he, b, t, pBlockHash, ha){
        chain.push({"Height":he,"Body":b,"Time":t,"previousBlockhash":pBlockHash,"hash":ha}) 
}

// http POST request for adding blocks
app.post('/block', (req,res) => {
    const block = {
        data: req.body.data
    }
    // checks if data is not empty
    if(!req.body.data){
        res.status(400).send("Please input a valid data!")
        return
    }
    // get key from db2 
    db2.get('key', function(err, value){
        // check if there is a genesis block
        if(!value){
            new Block(block.data)
            res.send("There was no Genesis block! Genesis block added now.. Your data is not added this time.")
        }else{
            // adding new block if there is a genesis block already present in the chain
            new Block(block.data)
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

// listening on PORT 8000
app.listen(8000, () => {
    console.log('Listening on port 8000!')
})

