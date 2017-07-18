'use strict';
exports.handler = function (req, res) {

	// Facebook Webhook setup
	if (req.method === 'GET') {
		console.log('Incoming request:\n' + JSON.stringify(req));
		console.log('Body:\n' + JSON.stringify(req.body));
		if (req.query['hub.mode'] === 'subcribe' && req.query['hub.verify_token'] === 'iambobbeepboop') {
			res.status(200).send(req.query['hub.challenge']);
		} else {
			res.status(403).send('Invalid Request');
		}
	// Facebook Message receiver
	} else if (req.method === 'POST') {
			res.status(200).json({});
	}
}
