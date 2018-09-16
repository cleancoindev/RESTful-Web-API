const express = require('express')
const app = express()
const SHA256 = require('crypto-js/sha256');

let chain = []

app.use(express.json())


class Block{
    constructor(data){
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

class Blockchain{
    constructor(data){
        this.addBlock(new Block(data));
    }

    addBlock(data){
        chain.push(data)   
    }
}   

app.post('/block', (req,res) => {
    const block = {
        data: req.body.data
    }
    if(!req.body.data){
        res.status(400).send("Please input a valid data!")
        return
    }
    if(chain.length == 0){
        let blockchain = new Blockchain(block.data)
        new Blockchain(block.data)
        res.send(chain[chain.length-1])
    }else{
        let blockchain = new Blockchain(block.data)
        res.send(chain[chain.length-1])
    }  
})

app.get('/block/:height', (req,res) => {
    if(req.params.height > chain.length-1){
            res.status(400).send(`Block with height ${req.params.height} does not exist!`)
            return
        }else{
            res.send(chain[req.params.height])
        }
})

app.get('/blockchain', (req, res) => {
    if(chain.length == 0){
        res.send("Blockchain is not yet created! No data!")
    }else{
        res.send(chain)
    }
})

app.listen(8000, () => {
    console.log('Listening on port 8000!')
})

