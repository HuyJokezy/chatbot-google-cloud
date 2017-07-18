'use strict';
exports.handler = function handler(req, res) {
	console.log('Start');
	console.log('Incoming request:\n' + JSON.stringify(req));
	console.log('Body:\n' + JSON.stringify(req.body));
	// Facebook Webhook setup
	if (req.method === 'GET') {
		if (req.query['hub.mode'] === 'subcribe' && req.query['hub.verify_token'] === 'iambobbeepboop') {
			res.status(200).send(req.query['hub.challenge']);
		} else {
			res.status(404).send('Invalid Request');
		}
	// Facebook Message receiver
	} else if (req.method === 'POST') {
			res.status(200).json({});
	}
}
