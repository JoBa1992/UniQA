'use strict';

angular.module('uniQaApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'About',
      'link': '/'
    },{
      'title': 'News',
      'link': '/news'
    },{
      'title': 'Contact',
      'link': '/contact'
    }];

    /* add additional items in with this
    ,{
      'title': 'Test',
      'link': '/test'
    }
    */
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
