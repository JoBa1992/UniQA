'use strict';

angular.module('uniQaApp')
  .controller('DepCtrl', function($scope, $http, Auth, Department) {

    // Use the User $resource to fetch all users
    $scope.departments = Department.get();


  });