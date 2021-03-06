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
			console.log(JSON.stringify(req.body));
			// Test Login button
			if (req.body.entry[0].messaging[0].message.text === 'loginbutton') {
				var request = require('request');
				var token = 'EAAB3JUNaWzgBAP5tksSuhv3Rhs2AsrSUCvJqbqUXVka1ZAgvZCCNMqSH71M8ExoW4Eel4ZCYaUcFNquEhmN7IGKyNWjOZAkWa7bek3PiAnNIDTlvIbZBsGAG93QnpZBI7ttcDimd6LZCIRuZCdj6NohEYlYuAucL3L9qLEx69X9taAZDZD';
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
							'attachment': {
								'type': 'template',
								'payload': {
									'template_type': 'button',
									'text': 'Login Now',
									'buttons': [
										{
											'type': 'account_link',
											'url': 'https://us-central1-chatbot-52601.cloudfunctions.net/login'
										}
									]
								}
							}
						}
					}
				};
				request(options, function () {
					res.status(200).json({});
				});
			}
			// Check if incoming message is echo
			else if (req.body.entry[0].messaging[0].message.is_echo !== true && req.body.entry[0].messaging[0].message.text !== undefined) {
				// Get PAGE_ACCESS_TOKEN
				const datastore = require('@google-cloud/datastore')({
				  keyFilename: 'key.json'
				});
				var token = '';
				var query = datastore.createQuery('Page').filter('id', '=', req.body.entry[0].messaging[0].recipient.id);
				datastore.runQuery(query).then((results) => {
					token = results[0][0].token;
					console.log(token);
					// After timeout duration. Send a waiting message to user
					var delayMessage = setTimeout(function () {
						var request = require('request');
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
					// Send typing
					sendTyping(req.body.entry[0].messaging[0].sender.id, token);
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
									respond(body.result.fulfillment.messages[i], req.body.entry[0].messaging[0].sender.id, token, callbackRespond(cur, max));
								}
							}
						}
					};
					request(options, callbackApiai);
				});
			} else {
				console.log('Echo Message');
				res.status(200).json({});
			}
		}
	} else if (req.method === 'HEAD') {
		console.log(JSON.stringify(req.body));
		res.status(200);
	} else {
		console.log(JSON.stringify(req.body));
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
//Send typing
function sendTyping (recipientId, token) {
	var request = require('request');
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
			'sender_action': 'typing_on'
		}
	};
	request(options, function () {
		console.log(' ');
	});
}
// Send responses to Facebook
function respond (messageFromApiAi, recipientId, token, callbackRespond) {
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
				if (messageFromApiAi.buttons[i].postback.substr(0,4) === 'http') {
					messageToFb.attachment.payload.elements[0].buttons.push({
						'type': 'web_url',
						'title': messageFromApiAi.buttons[i].text,
						'url': messageFromApiAi.buttons[i].postback
					});
				} else {
					messageToFb.attachment.payload.elements[0].buttons.push({
						'type': 'postback',
						'title': messageFromApiAi.buttons[i].text,
						'payload': messageFromApiAi.buttons[i].postback
					});
				}
			}
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
