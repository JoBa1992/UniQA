'use strict';

angular.module('uniQaApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'btford.socket-io',
    'ui.router',
    'ui.bootstrap'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    // root level routes
    $stateProvider
      .state('startLecture', {
        url: '/lecture/start',
        templateUrl: 'app/lectures/start.html',
        controller: 'LectureStartCtrl',
        authenticate: true
      })
      .state('lectMgr', {
        url: '/my/lectures',
        templateUrl: 'app/lectures/tutor.html',
        controller: 'LectureTutCtrl',
        authenticate: true
      })
      .state('questions', {
        url: '/my/questions',
        templateUrl: 'app/questions/tutor.html',
        controller: 'QuestionCtrl',
        authenticate: true
      })
      .state('statMgr', {
        url: '/my/stats',
        templateUrl: 'app/stats/statistics.html',
        controller: 'AdminStatsCtrl',
        authenticate: true
      });
    $urlRouterProvider
      .otherwise('/');
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
  return {
    // Add authorization token to headers
    request: function(config) {
      config.headers = config.headers || {};
      if ($cookieStore.get('token')) {
        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
      }
      return config;
    },

    // Intercept 401s and redirect you to login
    responseError: function(response) {
      if (response.status === 401) {
        $location.path('/login');
        // remove any stale tokens
        $cookieStore.remove('token');
        return $q.reject(response);
      } else {
        return $q.reject(response);
      }
    }
  };
})

.run(function($rootScope, $location, Auth) {
  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeStart', function(event, next) {
    Auth.isLoggedInAsync(function(loggedIn) {
      if (next.authenticate && !loggedIn) {
        event.preventDefault();
        $location.path('/login');
      }
    });
  });
});