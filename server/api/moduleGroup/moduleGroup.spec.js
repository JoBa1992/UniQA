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

	it('should begin with no modules', function(done) {
		Module.find({}, function(err, modules) {
			modules.should.have.length(0);
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
});