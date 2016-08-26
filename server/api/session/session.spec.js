'use strict';

var should = require('should');
var app = require('../../app');
var supertest = require('supertest');
var Session = require('./session.model');
var moment = require('moment');

var session = new Session({
	createdBy: '56a7d95746b9e7db57417309',
	lecture: '56d1ca2e4f6973280ce025e9',
	startTime: moment.utc(moment().add(16, 'hours')),
	endTime: moment.utc(moment().add(17, 'hours')),
	timeAllowance: 20,
	feedback: [{
		comment: "Lovely",
		rating: "3",
		user: "56cb76ecd5b3f4b6be5d7df0"
	}, {
		comment: "JoBa",
		rating: "3",
		user: "56a7bf8a800c479155488fcb"
	}],
	questions: [{
		asker: "56a7886405ab050a54d4eaa6",
		question: "How do I do this?",
		time: "2016-02-12T13:35:00Z",
		_id: "56dc84edd4357803006a440d",
		anon: false
	}, {
		asker: "56c86c25099777e930372eb7",
		question: "more questions...",
		time: "2016-02-12T13:40:00Z",
		_id: "56dc84edd4357803006a440c",
		anon: false
	}, {
		asker: "56a7afd3259ef46f559880c9",
		question: "Ridiculously stupidly incredibily long comment to test out how it looks",
		time: "2016-02-12T13:50:00Z",
		_id: "56dc84edd4357803006a440b",
		anon: false
	}, {
		question: "Send message",
		asker: "56a7bf8a800c479155488fcb",
		time: "2016-03-06T19:30:13Z",
		_id: "56dc8545d4357803006a4414",
		anon: null
	}, {
		question: "lexiva",
		asker: "56a7bf8a800c479155488fcb",
		time: "2016-03-06T19:30:40Z",
		_id: "56dc8560d4357803006a4415",
		anon: null
	}, {
		question: "Hey you guys",
		asker: "56a7bf8a800c479155488fcb",
		time: "2016-03-06T19:35:52Z",
		_id: "56dc8698d4357803006a4416",
		anon: null
	}, {
		question: "Loving the live action",
		asker: "56a7bf8a800c479155488fcb",
		time: "2016-03-06T19:35:59Z",
		_id: "56dc869fd4357803006a4417",
		anon: null
	}, {
		question: "Anon aswell",
		asker: "56a7bf8a800c479155488fcb",
		time: "2016-03-06T19:36:04Z",
		_id: "56dc86a4d4357803006a4418",
		anon: true
	}, {
		question: "Different",
		asker: "56cb76ecd5b3f4b6be5d7df0",
		time: "2016-03-06T19:38:42Z",
		_id: "56dc8742d4357803006a4419",
		anon: null
	}, {
		question: "Try something else",
		asker: "56cb76ecd5b3f4b6be5d7df0",
		time: "2016-03-06T19:40:42Z",
		_id: "56dc87bad4357803006a441a",
		anon: true
	}],
	registered: [{
		user: '56a7bf8a800c479155488fcb'
	}, {
		user: '56a7bf8a800c479155488fce'
	}, {
		user: '56cb76ecd5b3f4b6be5d7ddf'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de0'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de1'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de2'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de3'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de4'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de5'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de6'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de7'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de8'
	}, {
		user: '56cb76ecd5b3f4b6be5d7de9'
	}, {
		user: '56cb76ecd5b3f4b6be5d7dea'
	}, {
		user: '56cb76ecd5b3f4b6be5d7deb'
	}, {
		user: '56cb76ecd5b3f4b6be5d7dec'
	}, {
		user: '56cb76ecd5b3f4b6be5d7ded'
	}],
	modules: [{
		module: '56cb7c2e7bbe028ebfbe56a2'
	}, {
		module: '56cb7c2e7bbe028ebfbe56a3'
	}]
});

describe('Session Model', function() {
	var api = supertest.agent('http://localhost:9000/api/sessions');
	before(function(done) {
		// Clear sessions before testing
		Session.remove().exec().then(function() {
			done();
		});
	});

	afterEach(function(done) {
		Session.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no sessions', function(done) {
		Session.find({}, function(err, sessions) {
			sessions.should.have.length(0);
			done();
		});
	});

	it('should fail when saving a duplicate session', function(done) {
		session.save(function() {
			var sessionDup = new Session(session);
			sessionDup.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	it('should fail when saving without an email', function(done) {
		session.email = '';
		session.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should allow sessions to be created through api', function(done) {
		api
			.post('/')
			.send({
				createdBy: '56a7d95746b9e7db57417309',
				lecture: '56d1ca2e4f6973280ce025e9',
				startTime: moment.utc(moment().add(16, 'hours')),
				endTime: moment.utc(moment().add(17, 'hours')),
				timeAllowance: 20,
				feedback: [{
					comment: "Lovely",
					rating: "3",
					user: "56cb76ecd5b3f4b6be5d7df0"
				}, {
					comment: "JoBa",
					rating: "3",
					user: "56a7bf8a800c479155488fcb"
				}],
				questions: [{
					asker: "56a7886405ab050a54d4eaa6",
					question: "How do I do this?",
					time: "2016-02-12T13:35:00Z",
					_id: "56dc84edd4357803006a440d",
					anon: false
				}, {
					asker: "56c86c25099777e930372eb7",
					question: "more questions...",
					time: "2016-02-12T13:40:00Z",
					_id: "56dc84edd4357803006a440c",
					anon: false
				}, {
					asker: "56a7afd3259ef46f559880c9",
					question: "Ridiculously stupidly incredibily long comment to test out how it looks",
					time: "2016-02-12T13:50:00Z",
					_id: "56dc84edd4357803006a440b",
					anon: false
				}, {
					question: "Send message",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:30:13Z",
					_id: "56dc8545d4357803006a4414",
					anon: null
				}, {
					question: "lexiva",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:30:40Z",
					_id: "56dc8560d4357803006a4415",
					anon: null
				}, {
					question: "Hey you guys",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:35:52Z",
					_id: "56dc8698d4357803006a4416",
					anon: null
				}, {
					question: "Loving the live action",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:35:59Z",
					_id: "56dc869fd4357803006a4417",
					anon: null
				}, {
					question: "Anon aswell",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:36:04Z",
					_id: "56dc86a4d4357803006a4418",
					anon: true
				}, {
					question: "Different",
					asker: "56cb76ecd5b3f4b6be5d7df0",
					time: "2016-03-06T19:38:42Z",
					_id: "56dc8742d4357803006a4419",
					anon: null
				}, {
					question: "Try something else",
					asker: "56cb76ecd5b3f4b6be5d7df0",
					time: "2016-03-06T19:40:42Z",
					_id: "56dc87bad4357803006a441a",
					anon: true
				}],
				registered: [{
					user: '56a7bf8a800c479155488fcb'
				}, {
					user: '56a7bf8a800c479155488fce'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddf'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de0'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de1'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de2'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de3'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de4'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de5'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de6'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de7'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de8'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de9'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dea'
				}, {
					user: '56cb76ecd5b3f4b6be5d7deb'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dec'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ded'
				}],
				modules: [{
					module: '56cb7c2e7bbe028ebfbe56a2'
				}, {
					module: '56cb7c2e7bbe028ebfbe56a3'
				}]
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				done();
			});
	});

	it('should allow sessions to be updated through api', function(done) {
		api
			.post('/')
			.send({
				createdBy: '56a7d95746b9e7db57417309',
				lecture: '56d1ca2e4f6973280ce025e9',
				startTime: moment.utc(moment().add(16, 'hours')),
				endTime: moment.utc(moment().add(17, 'hours')),
				timeAllowance: 20,
				feedback: [{
					comment: "Lovely",
					rating: "3",
					user: "56cb76ecd5b3f4b6be5d7df0"
				}, {
					comment: "JoBa",
					rating: "3",
					user: "56a7bf8a800c479155488fcb"
				}],
				questions: [{
					asker: "56a7886405ab050a54d4eaa6",
					question: "How do I do this?",
					time: "2016-02-12T13:35:00Z",
					_id: "56dc84edd4357803006a440d",
					anon: false
				}, {
					asker: "56c86c25099777e930372eb7",
					question: "more questions...",
					time: "2016-02-12T13:40:00Z",
					_id: "56dc84edd4357803006a440c",
					anon: false
				}, {
					asker: "56a7afd3259ef46f559880c9",
					question: "Ridiculously stupidly incredibily long comment to test out how it looks",
					time: "2016-02-12T13:50:00Z",
					_id: "56dc84edd4357803006a440b",
					anon: false
				}, {
					question: "Send message",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:30:13Z",
					_id: "56dc8545d4357803006a4414",
					anon: null
				}, {
					question: "lexiva",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:30:40Z",
					_id: "56dc8560d4357803006a4415",
					anon: null
				}, {
					question: "Hey you guys",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:35:52Z",
					_id: "56dc8698d4357803006a4416",
					anon: null
				}, {
					question: "Loving the live action",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:35:59Z",
					_id: "56dc869fd4357803006a4417",
					anon: null
				}, {
					question: "Anon aswell",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:36:04Z",
					_id: "56dc86a4d4357803006a4418",
					anon: true
				}, {
					question: "Different",
					asker: "56cb76ecd5b3f4b6be5d7df0",
					time: "2016-03-06T19:38:42Z",
					_id: "56dc8742d4357803006a4419",
					anon: null
				}, {
					question: "Try something else",
					asker: "56cb76ecd5b3f4b6be5d7df0",
					time: "2016-03-06T19:40:42Z",
					_id: "56dc87bad4357803006a441a",
					anon: true
				}],
				registered: [{
					user: '56a7bf8a800c479155488fcb'
				}, {
					user: '56a7bf8a800c479155488fce'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddf'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de0'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de1'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de2'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de3'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de4'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de5'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de6'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de7'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de8'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de9'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dea'
				}, {
					user: '56cb76ecd5b3f4b6be5d7deb'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dec'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ded'
				}],
				modules: [{
					module: '56cb7c2e7bbe028ebfbe56a2'
				}, {
					module: '56cb7c2e7bbe028ebfbe56a3'
				}]
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				api
					.put('/' + res.body._id)
					.send({
						createdBy: '56a7d95746b9e7db57417309',
						lecture: '56d1ca2e4f6973280ce025e9',
						timeAllowance: 30
					})
					.end(function(err, res) {
						res.status.should.equal(200);
						should.not.exist(err);
						res.body.should.be.an.instanceOf(Object);
						res.body.timeAllowance.should.equal(30);
						done();
					});
			});
	});

	it('should allow sessions to be deleted through api', function(done) {
		api
			.post('/')
			.send({
				createdBy: '56a7d95746b9e7db57417309',
				lecture: '56d1ca2e4f6973280ce025e9',
				startTime: moment.utc(moment().add(16, 'hours')),
				endTime: moment.utc(moment().add(17, 'hours')),
				timeAllowance: 20,
				feedback: [{
					comment: "Lovely",
					rating: "3",
					user: "56cb76ecd5b3f4b6be5d7df0"
				}, {
					comment: "JoBa",
					rating: "3",
					user: "56a7bf8a800c479155488fcb"
				}],
				questions: [{
					asker: "56a7886405ab050a54d4eaa6",
					question: "How do I do this?",
					time: "2016-02-12T13:35:00Z",
					_id: "56dc84edd4357803006a440d",
					anon: false
				}, {
					asker: "56c86c25099777e930372eb7",
					question: "more questions...",
					time: "2016-02-12T13:40:00Z",
					_id: "56dc84edd4357803006a440c",
					anon: false
				}, {
					asker: "56a7afd3259ef46f559880c9",
					question: "Ridiculously stupidly incredibily long comment to test out how it looks",
					time: "2016-02-12T13:50:00Z",
					_id: "56dc84edd4357803006a440b",
					anon: false
				}, {
					question: "Send message",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:30:13Z",
					_id: "56dc8545d4357803006a4414",
					anon: null
				}, {
					question: "lexiva",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:30:40Z",
					_id: "56dc8560d4357803006a4415",
					anon: null
				}, {
					question: "Hey you guys",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:35:52Z",
					_id: "56dc8698d4357803006a4416",
					anon: null
				}, {
					question: "Loving the live action",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:35:59Z",
					_id: "56dc869fd4357803006a4417",
					anon: null
				}, {
					question: "Anon aswell",
					asker: "56a7bf8a800c479155488fcb",
					time: "2016-03-06T19:36:04Z",
					_id: "56dc86a4d4357803006a4418",
					anon: true
				}, {
					question: "Different",
					asker: "56cb76ecd5b3f4b6be5d7df0",
					time: "2016-03-06T19:38:42Z",
					_id: "56dc8742d4357803006a4419",
					anon: null
				}, {
					question: "Try something else",
					asker: "56cb76ecd5b3f4b6be5d7df0",
					time: "2016-03-06T19:40:42Z",
					_id: "56dc87bad4357803006a441a",
					anon: true
				}],
				registered: [{
					user: '56a7bf8a800c479155488fcb'
				}, {
					user: '56a7bf8a800c479155488fce'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ddf'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de0'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de1'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de2'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de3'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de4'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de5'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de6'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de7'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de8'
				}, {
					user: '56cb76ecd5b3f4b6be5d7de9'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dea'
				}, {
					user: '56cb76ecd5b3f4b6be5d7deb'
				}, {
					user: '56cb76ecd5b3f4b6be5d7dec'
				}, {
					user: '56cb76ecd5b3f4b6be5d7ded'
				}],
				modules: [{
					module: '56cb7c2e7bbe028ebfbe56a2'
				}, {
					module: '56cb7c2e7bbe028ebfbe56a3'
				}]
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				api
					.delete('/' + res.body._id)
					.end(function(err, res) {
						res.status.should.equal(204);
						should.not.exist(err);
						done();
					});
			});
	});

});