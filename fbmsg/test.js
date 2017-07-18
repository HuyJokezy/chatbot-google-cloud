const crypto = require('crypto');
const hash = crypto.createHash('sha1');
result = hash.update('\u0032\u0037\u0039\u0038\u0063\u0064\u0062\u0035\u0065\u0032\u0064\u0035\u0031\u0036\u0037\u0061\u0033\u0063\u0035\u0035\u0064\u0036\u0032\u0032\u0032\u0032\u0066\u0037\u0039\u0032\u0035\u0030');
console.log(result);
console.log('2798cdb5e2d5167a3c55d62222f79250');
// const input = fs.createReadStream(filename);
// input.on('readable', () => {
//   const data = input.read();
//   if (data)
//     hmac.update(data);
//   else {
//     console.log(`${hmac.digest('hex')} ${filename}`);
//   }
// });
