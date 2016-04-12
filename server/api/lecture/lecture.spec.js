'use strict';

var should = require('should');
var app = require('../../app');
var supertest = require('supertest');
var Lecture = require('./lecture.model');

var lecture = new Lecture({
	title: 'test lecture',
	author: '56a7d95746b9e7db57417309', // b2006241,
	desc: 'test description',
	collaborators: [{
		user: '56cb76ecd5b3f4b6be5d7ddb' // Martin
	}],
	url: 'http://www.mustbebuilt.co.uk/SHU/WAD/wad-wk8-lecture16.html'
});

describe('Lecture Model', function() {
	var api = supertest.agent('http://localhost:9000/api/lectures');

	before(function(done) {
		// Clear lectures before testing
		Lecture.remove().exec().then(function() {
			done();
		});
	});

	afterEach(function(done) {
		Lecture.remove().exec().then(function() {
			done();
		});
	});

	it('should begin with no lectures', function(done) {
		Lecture.find({}, function(err, lectures) {
			lectures.should.have.length(0);
			done();
		});
	});

	it('should fail when saving a duplicate lecture', function(done) {
		lecture.save(function() {
			var lectureDup = new Lecture(lecture);
			lectureDup.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	it('should fail when saving without an author', function(done) {
		lecture.author = '';
		lecture.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should fail when saving without an title', function(done) {
		lecture.title = '';
		lecture.save(function(err) {
			should.exist(err);
			done();
		});
	});

	it('should allow lecture to be created through api', function(done) {
		api
			.post('/')
			.send({
				data: {
					title: 'test lecture',
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
				done();
			});
	});

	it('should allow groups to be updated through api', function(done) {
		api
			.post('/')
			.send({
				data: {
					title: 'test lecture',
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
							title: 'updated lecture',
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

	it('should allow groups to be deleted through api', function(done) {
		api
			.post('/')
			.send({
				data: {
					title: 'test lecture',
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