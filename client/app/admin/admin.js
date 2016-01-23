'use strict';

angular.module('uniQaApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('generalMgr', {
        url: '/admin/general',
        templateUrl: 'app/admin/general/general.html',
        controller: 'GenCtrl',
        authenticate: true
      })
      .state('usersMgr', {
        url: '/admin/users',
        templateUrl: 'app/admin/users/users.html',
        controller: 'UserCtrl',
        authenticate: true
      })
      .state('depMgr', {
        url: '/admin/departments',
        templateUrl: 'app/admin/departments/departments.html',
        controller: 'DepCtrl',
        authenticate: true
      })
      .state('lectMgr', {
        url: '/admin/lectures',
        templateUrl: 'app/admin/lectures/lectures.html',
        controller: 'LectureCtrl',
        authenticate: true
      })
      .state('stats', {
        url: '/admin/stats',
        templateUrl: 'app/admin/stats/statistics.html',
        controller: 'StatsCtrl',
        authenticate: true
      });
  });