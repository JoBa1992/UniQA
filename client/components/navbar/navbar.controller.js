'use strict';

angular.module('uniQaApp')
  .controller('NavbarCtrl', function($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'About',
      'link': '/'
    }, {
      'title': 'News',
      'link': '/news'
    }, {
      'title': 'Contact',
      'link': '/contact'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isTeacher = Auth.isTutor;
    $scope.isStudent = Auth.isStudent;

    if ($scope.isLoggedIn())
      $scope.menu.root = '/profile';
    else
      $scope.menu.root = '/';

    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    console.log()


    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
