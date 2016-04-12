'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

// var department = new User({
// 	name: 'Test',
// 	subdepartment: [{
// 		name: 'subtest',
// 		groups: [{
// 			course: {
// 				type: String,
// 				required: true,
// 			},
// 			name: {
// 				type: String,
// 				required: true
// 			},
// 			users: [{
// 				type: mongoose.Schema.Types.ObjectId,
// 				ref: 'User'
// 			}],
// 			tutors: [{
// 				tutor: {
// 					type: mongoose.Schema.Types.ObjectId,
// 					ref: 'User',
// 				},
// 				_id: false
// 			}],
// 			deleted: {
// 				type: Boolean,
// 				default: false
// 			}
// 		}],
// 	}],
// 	deleted: false
// });
//
// describe('Department Model', function() {
// 	before(function(done) {
// 		// Clear users before testing
// 		User.remove().exec().then(function() {
// 			done();
// 		});
// 	});
//
// 	afterEach(function(done) {
// 		User.remove().exec().then(function() {
// 			done();
// 		});
// 	});
//
// 	it('should begin with no users', function(done) {
// 		User.find({}, function(err, users) {
// 			users.should.have.length(0);
// 			done();
// 		});
// 	});
//
// 	it('should fail when saving a duplicate user', function(done) {
// 		user.save(function() {
// 			var userDup = new User(user);
// 			userDup.save(function(err) {
// 				should.exist(err);
// 				done();
// 			});
// 		});
// 	});
//
// 	it('should fail when saving without an email', function(done) {
// 		user.email = '';
// 		user.save(function(err) {
// 			should.exist(err);
// 			done();
// 		});
// 	});
//
// 	it("should authenticate user if password is valid", function() {
// 		return user.authenticate('password').should.be.true;
// 	});
//
// 	it("should not authenticate user if password is invalid", function() {
// 		return user.authenticate('blah').should.not.be.true;
// 	});
// });
// describe('GET /api/departments', function() {
//
// 	it('should respond with JSON array', function(done) {
// 		request(app)
// 			.get('/api/departments')
// 			.expect(200)
// 			.expect('Content-Type', /json/)
// 			.end(function(err, res) {
// 				if (err) return done(err);
// 				res.body.should.be.instanceof(Array);
// 				done();
// 			});
// 	});
// });