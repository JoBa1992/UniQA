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
      .state('departments', {
        url: '/departments',
        templateUrl: 'app/admin/departments/departments.html',
        controller: 'DepCtrl',
        authenticate: true
      })
      .state('users', {
        url: '/users',
        templateUrl: 'app/admin/users/users.html',
        controller: 'UserCtrl',
        authenticate: true
      });
  });
