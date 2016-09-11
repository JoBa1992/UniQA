'use strict';

// Production specific configuration
// =================================
module.exports = {
	// Server IP
	ip: process.env.OPENSHIFT_NODEJS_IP ||
		process.env.IP ||
		undefined,

	// Server port
	port: process.env.OPENSHIFT_NODEJS_PORT ||
		process.env.PORT ||
		8080,

	s3: {
		accessKey: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		bucket: process.env.S3_BUCKET
	},

	// MongoDB connection options
	mongo: {
		uri: process.env.MONGOLAB_URI ||
			process.env.MONGOHQ_URL ||
			process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
			'mongodb://localhost/uniqa'
	}
};