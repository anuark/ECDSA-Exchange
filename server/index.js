const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const key = ec.genKeyPair();
const SHA256 = require('crypto-js/sha256');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const defaultBalances = [100, 50, 75];
const balances = {};
for (let i=0; i<3; i++) {
    const key = ec.genKeyPair();
    const publicKey = key.getPublic().encode('hex');
    const privateKey = key.getPrivate().toBuffer().toString('hex')

    balances[publicKey] = defaultBalances[i];
    console.log(`Account ${i} balance: ${defaultBalances[i]}`);
    console.log(`Public Key: ${publicKey}`);
    console.log(`Private Key: ${privateKey}`);
    console.log("");
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, signature, hash} = req.body;
  
  const publicKey = ec.keyFromPublic(sender, 'hex');

  if (!publicKey.verify(hash, signature)) {
      return res.status(400).send({ message: 'invalid signature' });
  }

  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;

  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

