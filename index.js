# adding necessary packages
const express = require('express')
const app = express()
const SHA256 = require('crypto-js/sha256');

# array that holds the blocks
let chain = []

# for using json in http POST request
app.use(express.json())


# block class for creating blocks
class Block{
    constructor(data){
            # checks if the chain has a genesis block or not
            if(chain.length == 0){
                this.height = 0,
                this.body = "Genesis Block",
                this.time = new Date().getTime().toString().slice(0,-3),
                this.previousBlockHash = "";
                this.hash = SHA256(JSON.stringify(this.body) + this.height + this.previousBlockHash + this.time).toString();
            }else{
                this.height = chain.length,
                this.body = data,
                this.time = new Date().getTime().toString().slice(0,-3),
                this.previousBlockHash = chain[chain.length-1].hash;
                this.hash = SHA256(JSON.stringify(this.body) + this.height + this.previousBlockHash + this.time).toString();
            }
    }
}

# blockchain class for adding blocks to the chain
class Blockchain{
    constructor(data){
        this.addBlock(new Block(data));
    }

    addBlock(data){
        chain.push(data)   
    }
}   

# http POST request for adding blocks
app.post('/block', (req,res) => {
    const block = {
        data: req.body.data
    }
    # checks if data is not empty
    if(!req.body.data){
        res.status(400).send("Please input a valid data!")
        return
    }
    # checks if there is a genesis block
    if(chain.length == 0){
        let blockchain = new Blockchain(block.data)
        new Blockchain(block.data)
        res.send(chain[chain.length-1])
    }else{
        let blockchain = new Blockchain(block.data)
        res.send(chain[chain.length-1])
    }  
})

# http GET request for getting blocks
app.get('/block/:height', (req,res) => {
    # checks if the block is present in the chain
    if(req.params.height > chain.length-1){
            res.status(400).send(`Block with height ${req.params.height} does not exist!`)
            return
        }else{
            res.send(chain[req.params.height])
        }
})

# (OPTIONAL) http GET request for getting the entire chain
app.get('/blockchain', (req, res) => {
    # checks if chain has blocks in it
    if(chain.length == 0){
        res.send("Blockchain is not yet created! No data!")
    }else{
        res.send(chain)
    }
})

# listening on PORT 8000
app.listen(8000, () => {
    console.log('Listening on port 8000!')
})

