const crypto = require('crypto');
const key = '2798cdb5e2d5167a3c55d62222f79250';
const res = '';
const text = 
res = res.substr(5);
hash = crypto.createHmac('sha1', key).update(text).digest('hex');
console.log(hash === res)
