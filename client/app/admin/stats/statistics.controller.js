'use strict';

angular.module('uniQaApp')
  .controller('StatsCtrl', function($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();


  });
