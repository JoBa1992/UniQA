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
			getNextFour: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				$http.get('/api/sessions/' + id + '/getnextfour').success(function(data) {
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
				// console.info(obj.createdBy);
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