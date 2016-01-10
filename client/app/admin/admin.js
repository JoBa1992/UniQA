'use strict';

angular.module('uniQaApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('stats', {
        url: '/stats',
        templateUrl: 'app/admin/stats/statistics.html',
        controller: 'StatsCtrl',
        authenticate: true
      })
      .state('unis', {
        url: '/unis',
        templateUrl: 'app/admin/universities/universities.html',
        controller: 'UniCtrl',
        authenticate: true
      })
      .state('users', {
        url: '/users',
        templateUrl: 'app/admin/users/users.html',
        controller: 'UserCtrl',
        authenticate: true
      });
  });
