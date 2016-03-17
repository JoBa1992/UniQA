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
				var data = angular.copy(obj.data);

				// remove
				delete data.tempPreview;

				$http.post('/api/lectures', {
					data: data
				}).success(function(data) {
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
						title: obj.title,
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
			remove: function(lecture, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				$http.delete('/api/lectures/' + lecture).success(function(data) {
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