'use strict';
exports.handler = function (req, res) {
	
	// Facebook Webhook setup
	if (req.method === 'GET') {
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
