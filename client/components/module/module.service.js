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
			getPossibleCollabs: function(obj, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();
				var userid = obj.user;
				var collab = obj.search;

				$http.get('/api/modules/assoc/' + userid + '?name=' + collab).success(function(data) {
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
				//var collab = obj.search;

				$http.get('/api/modules/user/' + userid).success(function(data) {
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
			create: function(query, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.post('/api/modules').success(function(data) {
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