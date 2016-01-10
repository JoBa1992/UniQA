'use strict';

angular.module('uniQaApp')
  .controller('NavbarCtrl', function($scope, $location, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isTeacher = Auth.isTeacher;
    $scope.isStudent = Auth.isStudent;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.leftMenu = [{
      'title': 'About',
      'link': '/',
      'login': false,
      'admin': true,
      'teacher': true,
      'student': true
    }, {
      'title': 'News',
      'link': '/news',
      'login': false,
      'admin': true,
      'teacher': true,
      'student': true
    }, {
      'title': 'Contact',
      'link': '/contact',
      'login': false,
      'admin': true,
      'teacher': true,
      'student': true
    }, {
      'title': 'Users',
      'link': '/users',
      'login': true,
      'admin': true,
      'teacher': false,
      'student': false
    }, {
      'title': 'Universities',
      'link': '/unis',
      'login': true,
      'admin': true,
      'teacher': false,
      'student': false
    }, {
      'title': 'Stats',
      'link': '/stats',
      'login': true,
      'admin': true,
      'teacher': false,
      'student': false
    }];
    $scope.rightMenu = [{
      'title': 'Register',
      'link': '/register',
      'login': false,
      'admin': false,
      'teacher': false,
      'student': false
    }, {
      'title': 'Sign In',
      'link': '/login',
      'login': false,
      'admin': false,
      'teacher': false,
      'student': false
    }];

    if ($scope.isLoggedIn()) {
      $scope.leftMenu.root = '/profile';
    } else {
      $scope.leftMenu.root = '/';
    }

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.isRoot = function() {
      if ($location.path() == "/") {
        return "navbar-inverse";
      }
      return "navbar-default";
    }
  });
