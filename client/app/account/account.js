'use strict';

angular.module('uniQaApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'app/account/register/register.html',
        controller: 'RegisterCtrl'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'app/account/profile/profile.html',
        controller: 'ProfileCtrl',
        authenticate: true
      })
      .state('settings', {
        url: '/profile/settings',
        templateUrl: 'app/account/profile/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  });
