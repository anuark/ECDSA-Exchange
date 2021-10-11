import "./index.scss";
import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');
import SHA256 from 'crypto-js/sha256';

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privateKey = document.getElementById("privateKey").value;
  const key = ec.keyFromPrivate(privateKey);
  const msgHash = SHA256(JSON.stringify({ sender, amount, recipient }));
  const signature = key.sign(msgHash.toString());

  const body = JSON.stringify({
    sender, amount, recipient, signature, hash: msgHash.toString()
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
