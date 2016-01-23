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
      getMyTotal: function(id, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        $http.get('/api/lectures/count', {
          params: {
            id
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
    };
  });