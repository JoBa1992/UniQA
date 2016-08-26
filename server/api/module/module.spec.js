'use strict';

var should = require('should');
var app = require('../../app');
var supertest = require('supertest');
var Module = require('./module.model');

var mod = new Module({
	course: 'test-course',
	students: [{
		user: '56a7bf8a800c479155488fcb' // b2006241
	}],
	tutors: [{
		user: '56a7d95746b9e7db57417309' // JoBa
	}],
	level: 5,
	deleted: false
});

describe('Module Model', function() {
	var api = supertest.agent('http://localhost:9000/api/modules');
	before(function(done) {
		// Clear users before testing
		Module.remove().exec().then(function() {
			done();
		});
	});

	// rip down after each test
	afterEach(function(done) {
		Module.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no mods', function(done) {
		Module.find({}, function(err, mods) {
			mods.should.have.length(0);
			done();
		});
	});

	it('should fail when saving without a course name', function(done) {
		mod.course = '';
		mod.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should allow mods to be created through api', function(done) {
		api
			.post('/')
			.send({
				course: 'test-course',
				students: [{
					user: '56a7bf8a800c479155488fcb' // b2006241
				}],
				tutors: [{
					user: '56a7d95746b9e7db57417309' // JoBa
				}],
				level: 5,
				deleted: false
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				done();
			});
	});

	it('should allow mods to be updated through api', function(done) {
		api
			.post('/')
			.send({
				course: 'test-course',
				students: [{
					user: '56a7bf8a800c479155488fcb' // b2006241
				}],
				tutors: [{
					user: '56a7d95746b9e7db57417309' // JoBa
				}],
				level: 5,
				deleted: false
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				api
					.put('/' + res.body._id)
					.send({
						course: 'updated-course',
						students: [{
							user: '56a7bf8a800c479155488fcb' // b2006241
						}],
						tutors: [{
							user: '56a7d95746b9e7db57417309' // JoBa
						}],
						level: 6,
						deleted: false
					})
					.end(function(err, res) {
						res.status.should.equal(200);
						should.not.exist(err);
						res.body.should.be.an.instanceOf(Object);
						res.body.course.should.equal('updated-course');
						res.body.level.should.equal(6);
						done();
					});
			});
	});

	it('should allow mods to be deleted through api', function(done) {
		api
			.post('/')
			.send({
				course: 'test-course',
				students: [{
					user: '56a7bf8a800c479155488fcb' // b2006241
				}],
				tutors: [{
					user: '56a7d95746b9e7db57417309' // JoBa
				}],
				level: 5,
				deleted: false
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