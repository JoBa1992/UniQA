'use strict';

angular.module('UniQA')
	.factory('Lesson', function Lesson($http, $q) {
		return {

			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			createLesson: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var data = angular.copy(obj.data);

				// remove
				delete data.tempPreview;

				$http.post('/api/lessons', {
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

				$http.post('/api/lessons/preview', {
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
			getByID: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/lessons/' + id).success(function(data) {
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

				$http.get('/api/lessons', {
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
				$http.get('/api/lessons/count', {
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
			remove: function(lesson, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				$http.delete('/api/lessons/' + lesson).success(function(data) {
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