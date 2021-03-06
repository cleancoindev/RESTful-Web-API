# RESTful-Web-API
This project is built on private blockchain that accepts string data as input through Express.js RESTful Web API.

## Tech/Framework used
* [Node.js](https://nodejs.org/en/) - Backend services.
* [Express.js](https://expressjs.com/) - Web application framework.
* [crypto-js](https://www.npmjs.com/package/crypto-js) - SHA256 Algorithm.
* [Postman](https://www.getpostman.com/) - API development environment.
* [levelDb](http://leveldb.org/) - Database to persist data.

## Installation
Install the required dependencies using [npm](https://www.npmjs.com/) package manager.
```
npm init --yes
npm install express --save
npm install crypto-js --save
npm install level --save
```
## How to use?
* Run the code using node.js.
`node index.js`
* Using postman, make the GET and POST http requests.
### POST
- `http://localhost:8000/block` and the corresponding JSON body as `{"body": "Testing block with test string data"
}`. After that you will get the corresponding output depending on your input.
### GET
- `http://localhost:8000/` - Responds with all the endpoints available.
- `http://localhost:8000/block/1` (corresponding block height) - Output is a block which is given as a height in http request.
- `http://localhost:8000/chain/` - Responds with the entire blockchain.

## Endpoint documentation
[RESTful-Web-API](https://documenter.getpostman.com/view/5369196/RWaLvnoX) - Refer for endpoint documentation.

## LICENSE
MIT © [Manolingam](./LICENSE)
