'use strict';

var should = require('should');
var app = require('../../app');
var supertest = require('supertest');
var Thing = require('./thing.model');

var thing = new Thing({
	name: 'uniEmail',
	content: '@shu.ac.uk'
});

describe('Thing Model', function() {
	var api = supertest.agent('http://localhost:9000/api/things');
	before(function(done) {
		// Clear things before testing
		Thing.remove().exec().then(function() {
			done();
		});
	});

	afterEach(function(done) {
		Thing.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no things', function(done) {
		Thing.find({}, function(err, things) {
			things.should.have.length(0);
			done();
		});
	});

	it('should fail when saving without a name', function(done) {
		thing.name = '';
		thing.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should allow thing to be created through api', function(done) {
		api
			.post('/')
			.send({
				name: 'testThing',
				content: 'all about the testing'
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				done();
			});
	});

	it('should allow modules to be updated through api', function(done) {
		api
			.post('/')
			.send({
				name: 'updateThisThing',
				content: 'all about the testing'
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				api
					.put('/' + res.body._id)
					.send({
						name: 'updatedThing',
						content: 'all about the updated testing'
					})
					.end(function(err, res) {
						res.status.should.equal(200);
						should.not.exist(err);
						res.body.should.be.an.instanceOf(Object);
						res.body.content[0].should.equal('all about the updated testing')
						done();
					});
			});
	});

	it('should allow modules to be deleted through api', function(done) {
		api
			.post('/')
			.send({
				name: 'deleteThisThing',
				content: 'delete me'
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