exports.handler = function (req, res) {
	// Calculate SHA-1 Hash
	const crypto = require('crypto');
	const secret = '2798cdb5e2d5167a3c55d62222f79250';
	const input = unicodeEscape(JSON.stringify(req.body));
	const hash = crypto.createHmac('sha1', secret).update(input).digest('hex');
	// Facebook Webhook setup
	if (req.method === 'GET') {
		if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'iambobbeepboop') {
			res.status(200).send(req.query['hub.challenge']);
		} else {
			res.status(403).send('Invalid Request');
		}
	// Facebook Message receiver
	} else if (req.method === 'POST') {
		// Validate request
		if (req.headers['x-hub-signature'] !== 'sha1=' + hash && false) {
			console.log('Invalid authentication credentials');
			console.log(hash);
			console.log(req.headers['x-hub-signature']);
			res.status(200).send('Invalid authentication credentials');
		} else {
			// console.log(JSON.stringify(req.body));
			// res.status(200).json({});
			// Check if incoming message is echo
			if (req.body.entry[0].messaging[0].message.is_echo !== true) {
				console.log('Normal Message: ' + req.body.entry[0].messaging[0].message.text);
				// After timeout duration. Send a waiting message to user
				var delayMessage = setTimeout(function () {
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
								'text': 'Xin chờ trong giây lát'
							}
						}
					};
					request(options, function () {
						res.status(200).json({});
					});
				}, 8000);

				// Make a request to API.AI
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
					if (body.result.metadata.webhookUsed === 'true' || body.result.metadata.webhookForSlotFillingUsed === 'true') {
						res.status(200).json({});
					} else {
						var callbackRespond = function (cur, max) {
							if (cur === max) {
								clearTimeout(delayMessage);
								res.status(200).json({});
							}
						};
						var cur = 0, max = 0;
						for (let i = 0; i < body.result.fulfillment.messages.length; i++) {
							if (body.result.fulfillment.messages[i].platform === 'facebook') {
								max = max + 1;
							}
						}
						for (let i = 0; i < body.result.fulfillment.messages.length; i++) {
							if (body.result.fulfillment.messages[i].platform === 'facebook') {
								cur = cur + 1;
								respond(body.result.fulfillment.messages[i], req.body.entry[0].messaging[0].sender.id, callbackRespond(cur, max));
							}
						}
					}
				};
				request(options, callbackApiai);
			} else {
				console.log('Echo Message');
				res.status(200).json({});
			}
		}
	} else if (req.method === 'HEAD') {
		res.status(200);
	} else {
		res.set('Allow', 'GET, POST, HEAD');
		res.status(405).json({});
	}
};

function unicodeEscape (str) {
  return str.replace(/[\s\S]/g, function (escape) {
		if (escape === '\\') {
			return '\\';
		} else if (escape === '<') {
			return '\\u003C';
		} else if (escape === '%') {
			return '\\u0025';
		} else if (escape === '@') {
			return '\\u0040';
		} else if (escape.charCodeAt() >= 32 && escape.charCodeAt() <= 127) {
      return escape;
    } else {
      return '\\u' + ('0000' + (escape.charCodeAt()).toString(16).toLowerCase()).slice(-4);
    }
  });
};

// Send responses to Facebook
function respond (messageFromApiAi, recipientId, callbackRespond) {
	var messageToFb = {};
	switch (messageFromApiAi.type) {
		// Text message
		case 0:
			messageToFb = {
				'text': messageFromApiAi.speech
			};
			break;
		// Card
		case 1:
		console.log('Case 1');
			messageToFb = {
				'attachment': {
					'type': 'template',
					'payload': {
						'template_type': 'generic',
						'elements': [
							{
								'title': messageFromApiAi.title,
								'subtitle': messageFromApiAi.subtitle,
								'image_url': messageFromApiAi.imageUrl,
								'default_action': {
									'type': 'web_url',
									'url': messageFromApiAi.imageUrl
								},
								'buttons': [
								]
							}
						]
					}
				}
			};
			for (let i = 0; i < messageFromApiAi.buttons.length; i++) {
				var tmp, type;
				if (messageFromApiAi.buttons[i].postback.substr(0,4) === 'http') {
					type = 'web_url';
					tmp = {url: messageFromApiAi.buttons[i].postback};
				} else {
					type = 'postback';
					tmp = {payload: messageFromApiAi.buttons[i].postback};
				}
				messageToFb.attachment.payload.elements[0].buttons.push({
					'type': type,
					'title': messageFromApiAi.buttons[i].text,
					tmp
				});
			}
			console.log(JSON.stringify(messageToFb));
			break;
		// Quick replies
		case 2:
			messageToFb = {
				'text': messageFromApiAi.title,
				'quick_replies': []
			};
			for (let i = 0; i < messageFromApiAi.replies.length; i++) {
				messageToFb.quick_replies.push({
					'content_type': 'text',
					'title': messageFromApiAi.replies[i],
					'payload': messageFromApiAi.replies[i]
				});
			}
			break;
		// Image
		case 3:
			messageToFb = {
				'attachment': {
					'type': 'image',
					'payload': {
						'url': messageFromApiAi.imageUrl
					}
				}
			};
			break;
		// Custom payload
		case 4:
			messageToFb = messageFromApiAi.payload;
			break;
		default:

	}
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
				'id': recipientId
			},
			'message': messageToFb
		}
	};
	request(options, callbackRespond);
};
