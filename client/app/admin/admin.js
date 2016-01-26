'use strict';

angular.module('uniQaApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('genMgr', {
        url: '/admin/general',
        templateUrl: 'app/admin/general/general.html',
        controller: 'AdminGenCtrl',
        authenticate: true
      })
      .state('userMgr', {
        url: '/admin/users',
        templateUrl: 'app/admin/users/users.html',
        controller: 'AdminUserCtrl',
        authenticate: true
      })
      .state('depMgr', {
        url: '/admin/departments',
        templateUrl: 'app/admin/departments/departments.html',
        controller: 'AdminDepCtrl',
        authenticate: true
      })
      .state('lectMgr', {
        url: '/admin/lectures',
        templateUrl: 'app/admin/lectures/lectures.html',
        controller: 'AdminLectureCtrl',
        authenticate: true
      })
      .state('statMgr', {
        url: '/admin/stats',
        templateUrl: 'app/admin/stats/statistics.html',
        controller: 'AdminStatsCtrl',
        authenticate: true
      })
      .state('groupMgr', {
        url: '/admin/groups',
        templateUrl: 'app/admin/groups/groups.html',
        controller: 'AdminGroupCtrl',
        authenticate: true
      });
  });