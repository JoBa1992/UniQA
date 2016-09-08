'use strict';

angular.module('uniQaApp')
	.factory('Module', function Department($http, $q) {
		return {
			get: function(callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/modules').success(function(data) {
					deferred.resolve(data);
					return cb;
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getByID: function(id, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/modules/' + id).success(function(data) {
					deferred.resolve(data);
					return cb;
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getTutors: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var userid = obj.user;
				var tutorName = obj.search;

				$http.get('/api/users?me=' + userid + '&name=' + tutorName + '&role=tutor&getTutors=true').success(function(data) {
					deferred.resolve(data);
					return cb;
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getMyAssocModules: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var userid = obj.user;

				$http.get('/api/modules/user/' + userid).success(function(data) {
					deferred.resolve(data);
					return cb;
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getExplorableModules: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var userid = obj.user;

				$http.get('/api/modules/user/' + userid + '/unassoc').success(function(data) {
					deferred.resolve(data);
					return cb;
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			getByName: function(query, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/modules?name=' + query).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			create: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.post('/api/modules', obj).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			update: function(query, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var id = query.id;

				$http.put('/api/modules/' + id).success(function(data) {
					deferred.resolve(data);
					return cb();
				}).error(function(err) {
					deferred.reject(err);
					return cb(err);
				}.bind(this));
				return deferred.promise;
			},
			delete: function(query, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var id = query.id;

				$http.delete('/api/modules/' + id).success(function(data) {
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