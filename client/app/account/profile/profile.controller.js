'use strict';

angular.module('uniQaApp')
  .controller('ProfileCtrl', function($scope, User, Auth) {
    $scope.errors = {};
    $scope.getCurrentUser = Auth.getCurrentUser;

  });
