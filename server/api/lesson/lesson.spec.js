'use strict';

var should = require('should');
var app = require('../../app');
var supertest = require('supertest');
var Lesson = require('./lesson.model');

var lesson = new Lesson({
	title: 'test lesson',
	author: '56a7d95746b9e7db57417309', // b2006241,
	desc: 'test description',
	collaborators: [{
		user: '56cb76ecd5b3f4b6be5d7ddb' // Martin
	}],
	url: 'http://www.mustbebuilt.co.uk/SHU/WAD/wad-wk8-lesson16.html'
});

describe('Lesson Model', function() {
	var api = supertest.agent('http://localhost:9000/api/lessons');

	before(function(done) {
		// Clear lessons before testing
		Lesson.remove().exec().then(function() {
			done();
		});
	});

	afterEach(function(done) {
		Lesson.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no lessons', function(done) {
		Lesson.find({}, function(err, lessons) {
			lessons.should.have.length(0);
			done();
		});
	});

	it('should fail when saving without an author', function(done) {
		lesson.author = '';
		lesson.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should fail when saving without an title', function(done) {
		lesson.title = '';
		lesson.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should allow lesson to be created through api', function(done) {
		api
			.post('/')
			.send({
				data: {
					title: 'test lesson',
					author: '56cb76ecd5b3f4b6be5d7ddb',
					collaborators: [{
						user: '56cb76ebd5b3f4b6be5d7dd1'
					}]
				}
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
				data: {
					title: 'test lesson',
					author: '56a7d95746b9e7db57417309', // b2006241,
					desc: 'test description',
					collaborators: [{
						user: '56cb76ecd5b3f4b6be5d7ddb' // Martin
					}]
				}
			})
			.end(function(err, res) {
				res.status.should.equal(201);
				should.not.exist(err);
				res.body.should.be.an.instanceOf(Object);
				api
					.put('/' + res.body._id)
					.send({
						data: {
							title: 'updated lesson',
							author: '56a7d95746b9e7db57417309', // b2006241,
							desc: 'updated description',
							collaborators: [{
								user: '56cb76ecd5b3f4b6be5d7ddb' // Martin
							}]
						}
					})
					.end(function(err, res) {
						res.status.should.equal(200);
						should.not.exist(err);
						res.body.should.be.an.instanceOf(Object);
						done();
					});
			});
	});

	it('should allow modules to be deleted through api', function(done) {
		api
			.post('/')
			.send({
				data: {
					title: 'test lesson',
					author: '56a7d95746b9e7db57417309', // b2006241,
					desc: 'test description',
					collaborators: [{
						user: '56cb76ecd5b3f4b6be5d7ddb' // Martin
					}]
				}
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