'use strict';

angular.module('uniQaApp')
	.factory('Lecture', function Lecture($http, $q) {
		return {

			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			createLecture: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var lecture = obj.lecture;

				$http.post('/api/lectures', lecture).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			generatePreview: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var url = obj.url;

				$http.post('/api/lectures/preview', {
					url: url
				}).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getOne: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/lectures/' + id).success(function(data) {
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

				$http.get('/api/lectures', {
					params: {
						createdBy: obj.createdBy,
						page: obj.page,
						paginate: obj.paginate
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