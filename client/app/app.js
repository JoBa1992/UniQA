'use strict';

angular.module('uniQaApp', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngAnimate',
		'ui.router',
		'ui.bootstrap',
		'btford.socket-io'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
		// root level routes
		$stateProvider
			.state('startSession', {
				url: '/session/start',
				templateUrl: 'app/session/start.html',
				controller: 'SessionStartCtrl',
				authenticate: true
			})
			.state('activeSession', {
				url: '/session/active/:sessionid',
				templateUrl: 'app/session/active.html',
				controller: 'SessionActiveCtrl',
				authenticate: true
			})
			.state('lectMgr', {
				url: '/my/lectures',
				templateUrl: 'app/lectures/tutor.html',
				controller: 'LectureTutCtrl',
				authenticate: true
			})
			.state('userSchedule', {
				url: '/my/schedule',
				templateUrl: 'app/schedule/schedule.html',
				controller: 'ScheduleCtrl',
				authenticate: true
			})
			.state('feedback', {
				url: '/my/feedback',
				templateUrl: 'app/feedback/feedback.html',
				controller: 'FeedbackCtrl',
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
	.run(function($rootScope, $location, socket, Auth, Session) {
		// check for scope state changes
		//next, current
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			// if not on active lecture, unsync socket listening for questions
			if (toState.url !== '/session/active/:sessionid') {
				socket.unsyncUpdates('session');
			} else {
				if (!toParams.sessionid) {
					return $location.url('/session/start');
				}
				var sessionid = toParams.sessionid;
				var now = moment.utc();
				var _second = 1000;
				var _minute = _second * 60;
				// don't want user accessing page if session isn't valid
				Session.getOne(sessionid).then(function(res) {
					var start = moment(moment(res.startTime).utc() - (res.timeAllowance * _minute)).utc();
					var end = moment(moment(res.endTime).utc() + (res.timeAllowance * _minute)).utc();

					// if session isn't between goalposts kick back to session start
					if (!(now >= start && now <= end)) {
						return $location.url('/session/start');
					}
				});
			}
			// don't want users going to 'homepage' if logged in
			if (toState.url === '/') {
				Auth.isLoggedInAsync(function(loggedIn) {
					if (loggedIn) {
						$location.path('/profile');
					}
				});
			}
		});

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