'use strict';

angular.module('uniQaApp')
	.factory('Session', function Lecture($http, $q) {
		return {

			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			getOne: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/sessions/' + id).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getNextFourTutor: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				$http.get('/api/sessions/' + id + '/getnextfour/tutor').success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			// getNextForStudent: function(id, callback) {
			// 	var cb = callback || angular.noop;
			// 	var deferred = $q.defer();
			// 	$http.get('/api/sessions/' + id + '/getnext/student').success(function(data) {
			// 		deferred.resolve(data);
			// 		return cb();
			// 	}).error(function(err) {
			// 		deferred.reject(err);
			// 		return cb(err);
			// 	}.bind(this));
			// 	return deferred.promise;
			// },
			createSession: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var lecture = obj.lecture;

				$http.post('/api/session', lecture).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getForMe: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var history = obj.historic || null;
				var order = obj.order || null;

				$http.get('/api/sessions', {
					params: {
						author: obj.createdBy,
						history: history,
						order: order
							// page: obj.page,
							// paginate: obj.paginate
					}
				}).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getMyTotal: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/lectures/count', {
					params: {
						createdBy: obj.createdBy
					}
				}).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			register: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var userid = obj.user;
				var url = obj.url || null;
				var altAccess = obj.altAccess || null;

				$http.put('/api/sessions/register/' + userid, {
					params: {
						url: url,
						altAccess: altAccess
					}
				}).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			sendMsg: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var sessionid = obj.session;
				var anon = obj.anon || null;

				$http.post('/api/sessions/' + sessionid + '/question', {
					params: {
						question: obj.question,
						asker: obj.asker,
						anon: anon,
					}
				}).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			sendFeedback: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var sessionid = obj.session;

				$http.post('/api/sessions/' + sessionid + '/feedback', {
					params: {
						user: obj.user,
						rating: obj.rating,
						comment: obj.comment
					}
				}).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			remove: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				id = id._id;
				$http.delete('/api/lectures/' + id).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
		};
	});