'use strict';

angular.module('uniQaApp')
  .controller('NavbarCtrl', function($scope, $location, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isTutor = Auth.isTutor;
    $scope.isStudent = Auth.isStudent;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.leftMenu = [{
      title: 'Gen',
      link: '/admin/general',
      login: true,
      admin: true,
      tutor: false,
      student: false
    }, {
      title: 'Start Lecture',
      link: '/lecture/start',
      //   link: '#',
      login: true,
      admin: false,
      tutor: true,
      student: false
    }, {
      title: 'Users',
      link: '/admin/users',
      login: true,
      admin: true,
      tutor: false,
      student: false
    }, {
      title: 'My Lectures',
      link: '/my/lectures',
      //   link: '#',
      login: true,
      admin: false,
      tutor: true,
      student: true
    }, {
      title: 'Groups',
      link: '/admin/groups',
      //   link: '#',
      login: true,
      admin: true,
      tutor: false,
      student: false
    }, {
      title: 'My Groups',
      link: '/my/groups',
      //   link: '#',
      login: true,
      admin: false,
      tutor: true,
      student: false
    }, {
      title: 'Deps',
      link: '/admin/departments',
      login: true,
      admin: true,
      tutor: false,
      student: false
    }, {
      title: 'Lectures',
      link: '/admin/lectures',
      login: true,
      admin: true,
      tutor: false,
      student: false
    }, {
      title: 'Questions',
      link: '/my/questions',
      //   link: '#',
      login: true,
      admin: false,
      tutor: true,
      student: false
    }, {
      title: 'Lecture Reg',
      link: '/lecture/register',
      //   link: '#',
      login: true,
      admin: false,
      tutor: false,
      student: true
    }, {
      title: 'My Questions',
      link: '/my/questions/',
      //   link: '#',
      login: true,
      admin: false,
      tutor: false,
      student: true
    }, {
      title: 'Stats',
      link: '/admin/stats',
      login: true,
      admin: true,
      tutor: false,
      student: false
    }, {
      title: 'Modal Dev',
      //   link: '/my/questions/',
      link: '/dev',
      login: true,
      admin: true,
      tutor: true,
      student: true
    }];
    $scope.rightMenu = [{
      title: 'Register',
      link: '/register',
      login: false,
      admin: false,
      tutor: false,
      student: false
    }, {
      title: 'Sign in',
      link: '/login',
      login: false,
      admin: false,
      tutor: false,
      student: false
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
      //   console.info(route);
      return route === $location.path();
    };

    $scope.isRoot = function() {
      if ($location.path() == "/") {
        return "navbar-inverse";
      }
      return "navbar-default";
    }
  });