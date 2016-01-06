'use strict';

angular.module('uniQaApp')
  .controller('FooterCtrl', function ($scope, $location, Auth) {
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
	
  });
