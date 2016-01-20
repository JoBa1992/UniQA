'use strict';

angular.module('uniQaApp')
  .factory('Department', function Department($http, $q) {
    return {
      get: function(callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.get('/api/departments').success(function(data) {
          deferred.resolve(data);
          return cb();
        }).error(function(err) {
          deferred.reject(err);
          return cb(err);
        }.bind(this));
        return deferred.promise;
      },
      getByName: function(query, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.get('/api/departments?name=' + query).success(function(data) {
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

        $http.get('/api/departments').success(function(data) {
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

        $http.get('/api/departments').success(function(data) {
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

        $http.get('/api/departments').success(function(data) {
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