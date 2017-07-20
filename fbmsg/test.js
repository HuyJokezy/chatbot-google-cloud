var test = function (str) {
  return str.replace(/[\s\S]/g, function (escape) {
    if (escape.charCodeAt() >= 32 && escape.charCodeAt() <= 127) {
      return escape;
    } else {
      return '\\u' + ('0000' + (escape.charCodeAt()).toString(16).toLowerCase()).slice(-4);
    }
  });
}
var test1 = function (str) {
  return str.replace(/[\s\S]/g, function (escape) {
    return '\\u' + ('0000' + (escape.charCodeAt()).toString(16).toLowerCase()).slice(-4);
  });
}
const crypto = require('crypto');
var key = '2798cdb5e2d5167a3c55d62222f79250';
var res = '35bd72f9abf2279830c24d3a283354452f1bc837';
var text = '{"object":"page","entry":[{"id":"1731976853769791","time":1500373757081,"messaging":[{"sender":{"id":"1427297504030226"},"recipient":{"id":"1731976853769791"},"timestamp":1500373756791,"message":{"mid":"mid.$cAAZ9yi_MppVjhoPzd1dVT5bZW8F9","seq":542882,"text":"xin chào"}}]}]}';
var text1 = '{"object":"page","entry":[{"id":"1731976853769791","time":1500373757081,"messaging":[{"sender":{"id":"1427297504030226"},"recipient":{"id":"1731976853769791"},"timestamp":1500373756791,"message":{"mid":"mid.$cAAZ9yi_MppVjhoPzd1dVT5bZW8F9","seq":542882,"text":"xin ch\\u00e0o"}}]}]}';
text1 = test1(text);
const hash = crypto.createHmac('sha1', key).update(text).digest('hex');
const hash1 = crypto.createHmac('sha1', key).update(text1,'latin1').digest('hex');
console.log(res);
console.log(hash);
console.log(hash1);
// console.log(res);
console.log(test('xin chào'));
// console.log(text === 'à');

var test2 = 'https://google.com';
var tmp = (test2.substr(0,3) === 'http') ? {'url': test2} : {'payload': test2};
var type = (test2.substr(0,3) === 'http') ? 'web_url' : 'postback';
console.log(test2.substr(0,3));
console.log(JSON.stringify(tmp) + ' ' + type);
