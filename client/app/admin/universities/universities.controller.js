'use strict';

angular.module('uniQaApp')
  .controller('UniCtrl', function($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();


  });
