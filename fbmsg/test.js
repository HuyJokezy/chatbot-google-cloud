const crypto = require('crypto');
const key = '2798cdb5e2d5167a3c55d62222f79250';
const res = '7ce3c21bc39c4fae8c13c745b33cf9490fdd9e11';
const text = '{"object":"page","entry":[{"id":"1731976853769791","time":1500372065142,"messaging":[{"sender":{"id":"1427297504030226"},"recipient":{"id":"1731976853769791"},"timestamp":1500372065025,"message":{"mid":"mid.$cAAZ9yi_MppVjhmojAVdVSSK8t9W2","seq":542844,"text":"hi"}}]}]}';
const hash = crypto.createHmac('sha1', key).update(text).digest('hex');
console.log(hash);
console.log(res);
