'use strict';

angular.module('uniQaApp')
	.factory('Group', function Department($http, $q) {
		return {
			get: function(callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.get('/api/groups').success(function(data) {
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

				$http.get('/api/groups/assoc/' + userid).success(function(data) {
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

				$http.get('/api/groups?name=' + query).success(function(data) {
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

				$http.post('/api/groups').success(function(data) {
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

				$http.put('/api/groups/' + id).success(function(data) {
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

				$http.delete('/api/groups/' + id).success(function(data) {
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