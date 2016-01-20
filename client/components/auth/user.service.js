'use strict';

angular.module('uniQaApp')
  .factory('User', function($http, $q, $resource) {
    // return {
    //   get: function(query, callback) {
    //     var cb = callback || angular.noop;
    //     var deferred = $q.defer();
    //
    //     $http.get('/api/users/me').success(function(data) {
    //       deferred.resolve(data);
    //       return cb();
    //     }).error(function(err) {
    //       deferred.reject(err);
    //       return cb(err);
    //     }.bind(this));
    //     return deferred.promise;
    //   },
    //   changePassword: function(uID, passwords, callback) {
    //     var cb = callback || angular.noop;
    //     var deferred = $q.defer();
    //
    //     $http.put('/api/users/' + uID + '/password', passwords).success(function(data) {
    //       deferred.resolve(data);
    //       return cb();
    //     }).error(function(err) {
    //       deferred.reject(err);
    //       return cb(err);
    //     }.bind(this));
    //     return deferred.promise;
    //   },
    //
    // };


    return $resource('/api/users/:count/:id/:controller', {
      id: '@_id'
    }, {
      changePassword: {
        method: 'PUT',
        params: {
          controller: 'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id: 'me'
        }
      },
      filtGet: {
        method: 'GET',
        isArray: true
      },
      getTotal: {
        method: 'GET',
        params: {
          count: "count"
        }
      }
    });





  });