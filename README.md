## Node.js SDK for Moopay payment gateway integration.

Repo aim is to simplify api integration.

Please go throught [Official documentation](https://docs.moopay.live) to get overview of how payment integration works.

### Installation

```sh
$ npm install --save-exact @moopay/sdk-nodejs
```

### Initialize

```sh
const Moopay = require('@moopay/sdk-nodejs').Moopay;
// by default it makes connection to testnet, pass in false as third argument to connect to production servers.
const mp = new Moopay(apiKey, apiSecret);
```

### Create Order

Please checkout [Order options](https://docs.moopay.live/api%20access/create-order/) to see all possible options available during order creation.

```sh
const orderOptions = {amount: 1};

// create method returns a promise, you can either use async/await or handle the promise yourself.
const order = mp.order.create(orderOptions);
order.then(result => {
    // called on successful creation of order
}).catch(err => {
    // an error occured during order creation.
})
```
