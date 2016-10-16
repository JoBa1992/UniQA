'use strict';

var should = require('should');
var app = require('../../app');
var supertest = require('supertest');
var Issue = require('./issue.model');

var issue = new Issue({
	name: 'uniEmail',
	content: '@shu.ac.uk'
});

describe('Issue Model', function() {
	var api = supertest.agent('http://localhost:9000/api/issues');
	before(function(done) {
		// Clear issues before testing
		Issue.remove().exec().then(function() {
			done();
		});
	});

	afterEach(function(done) {
		Issue.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no issues', function(done) {
		Issue.find({}, function(err, issues) {
			issues.should.have.length(0);
			done();
		});
	});

	it('should fail when saving without a name', function(done) {
		issue.name = '';
		issue.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should allow issue to be created through api', function(done) {
		api
			.post('/')
			.send({
				name: 'testIssue',
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
				name: 'updateThisIssue',
				content: 'all about the testing'
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				api
					.put('/' + res.body._id)
					.send({
						name: 'updatedIssue',
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
				name: 'deleteThisIssue',
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