'use strict';

angular.module('uniQaApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('index', {
        url: '/',
        templateUrl: 'app/index/index.html',
        controller: 'HomeCtrl'
      });
  });
