'use strict';

angular.module('UniQA')
	.factory('Session', function Lecture($http, $q, $window) {
		return {

			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			getById: function(id, callback) {
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
			createSession: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var session = obj;

				$http.post('/api/sessions', session).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getFile: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var fileId = obj.file._id || null;
				var lectureId = obj.lecture || null;
				var sessionId = obj.session || null;
				var userId = obj.user || null;

				$http.get('/api/sessions/download/' + sessionId + '/' + userId + '/' + lectureId + '/' + fileId).success(function(data) {
					$window.open('/api/sessions/download/' + sessionId + '/' + userId + '/' + lectureId + '/' + fileId); //does the download
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

				$http.get('/api/sessions', {
					params: {
						createdBy: obj.createdBy || null,
						author: obj.author || null,
						history: obj.historic || null,
						order: obj.order || null //,
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