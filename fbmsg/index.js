exports.handler = function (req, res) {
	const crypto = require('crypto');
	const secret = '2798cdb5e2d5167a3c55d62222f79250';
	console.log(req.body);
	console.log(req.headers['x-hub-signature']);
	if (req.headers['x-hub-signature'] !== 'sha1=fe4196c7ee2bde02f5a8a9263a6007d6c10bf761') {
		res.status(200).send('Invalid authentication credentials');
	} else {
		// Facebook Webhook setup
		if (req.method === 'GET') {
			if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'iambobbeepboop') {
				res.status(200).send(req.query['hub.challenge']);
			} else {
				res.status(403).send('Invalid Request');
			}
		// Facebook Message receiver
		} else if (req.method === 'POST') {
			if (req.body.entry[0].messaging[0].message.is_echo !== true) {
				console.log('Normal Message: ' + req.body.entry[0].messaging[0].message.text);
				var request = require('request');
				var options = {
					uri: 'https://api.api.ai/v1/query?v=20150910',
					method: 'POST',
					json: true,
					headers: {
						'Authorization': 'Bearer 2b40192ac2b84bc195cd1d0051895322',
						'Content-Type': 'application/json; charset=utf-8'
					},
					body: {
						'query': req.body.entry[0].messaging[0].message.text,
						'lang': 'en',
						'sessionId': req.body.entry[0].messaging[0].message.mid,
						'originalRequest': {
							'source': 'facebook',
							'data': req.body.entry[0].messaging[0]
						}
					}
				};
				var callbackApiai = function (error, response, body) {
					var request = require('request');
					var token = 'EAAB3JUNaWzgBAJkbBLaCrGgVDoLUfHChBkf0qi8yE9Bg0azTRmMzcpbe2yojIPThR1BxT9HMwcwBlSl2ZBXDGJUS9mFFGedTxGRYKxq9n6ZCj9XqoGDvkr9sVrh3D6tqcjOMBhZC9y8Yxeaix3QTNTZA2r2hATWl8TJ0LCPpBgZDZD';
					var options = {
						uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=' + token,
						method: 'POST',
						json: true,
						headers: {
							'Content-Type': 'application/json'
						},
						body: {
							'recipient': {
								'id': req.body.entry[0].messaging[0].sender.id
							},
							'message': {
								'text': body.result.fulfillment.speech
							}
						}
					};
					request(options, function () {
						res.status(200).json({});
					});
				};
				request(options, callbackApiai);
			} else {
				console.log('Echo Message');
				res.status(200).json({});
			}
		} else if (req.method === 'HEAD') {
			res.status(200);
		} else {
			res.set('Allow', 'GET, POST, HEAD');
			res.status(405).json({});
		}
	}
};

var respond = function () {

};
