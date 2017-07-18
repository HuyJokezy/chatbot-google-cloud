exports.handler = function (req, res) {
	console.log('Receiving request');
	// console.log('Body:\n' + req.body);
	// Facebook Webhook setup
	if (req.method === 'GET') {
		if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'iambobbeepboop') {
			res.status(200).send(req.query['hub.challenge']);
		} else {
			res.status(403).send('Request Problem');
		}
	// Facebook Message receiver
	} else if (req.method === 'POST') {
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
				var options = {
					uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=EAAB3JUNaWzgBAK9X0ZBWT5QALfGKqG81pLJ0i5oPIhY3FNPkuwbYXJZBXcYKGo3Tip8bcdFi6qoathpykieZCQcRmXljOrEWaA4iy7bHXiS8gl2gqXxOpq7ZCm3rbIFXUVLYdvVzEXgRZAwPB85M4TbF6j3xHZC5oWxYe24EqKxAZDZD',
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
			res.status(200).json({});
	}
};
