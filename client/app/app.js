'use strict';

angular.module('UniQA', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngAnimate',
		'ngDropzone',
		'ngMaterial',
		'ui.router',
		'ui.bootstrap',
		'angular-loading-bar',
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
			.state('lessonList', {
				url: '/lessons',
				templateUrl: 'app/lessons/lessonList.html',
				controller: 'LessonListCtrl',
				authenticate: true
			})
			.state('lesson', {
				url: '/lessons/:lessonid',
				templateUrl: 'app/lessons/lesson.html',
				controller: 'LessonCtrl',
				authenticate: true
			})
			.state('moduleList', {
				url: '/modules',
				templateUrl: 'app/modules/moduleList.html',
				controller: 'ModuleListCtrl',
				authenticate: true
			})
			.state('module', {
				url: '/modules/:moduleid',
				templateUrl: 'app/modules/module.html',
				controller: 'ModuleCtrl',
				authenticate: true
			})
			.state('moduleGroup', {
				url: '/modules/:moduleid/groups/:groupid',
				templateUrl: 'app/moduleGroup/moduleGroup.html',
				controller: 'ModuleGroupCtrl',
				authenticate: true
			})
			.state('qrListener', {
				url: '/qr/register/:sessionid',
				templateUrl: 'app/account/login/login.html',
				controller: 'QrRegistrationCtrl'
			})
			.state('dashboard', {
				url: '/dashboard',
				templateUrl: 'app/dashboard/dashboard.html',
				controller: 'DashboardCtrl',
				authenticate: true
			})
			.state('notifications', {
				url: '/notifications',
				templateUrl: 'app/account/profile/notifications/notifications.html',
				controller: 'NotificationCtrl',
				authenticate: true
			})
			.state('statMgr', {
				url: '/stats',
				templateUrl: 'app/stats/statistics.html',
				controller: 'AdminStatsCtrl',
				authenticate: true
			})
			.state('registerSession', {
				url: '/session/register',
				templateUrl: 'app/session/register.html',
				controller: 'SessionRegisterCtrl',
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
					var loc = $location.path().substring(1, $location.path().length).split('/');
					// check to see if req is coming from qr login
					if (loc[0] === 'qr') {
						// $location.path('$loca');
					} else {
						$location.path('/');
					}

					// remove any stale tokens
					$cookieStore.remove('token');
					return $q.reject(response);
				} else {
					return $q.reject(response);
				}
			}
		};
	})
	.run(function($rootScope, $location, $window, socket, Auth, Session, Module) {
		// check for scope state changes
		// next, current
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
			Auth.isLoggedInAsync(function(loggedIn) {
				if (loggedIn) {
					event.preventDefault();
					// don't want users going to 'homepage' if logged in
					if (toState.url === '/' || toState.url === '/login' || toState.url === '/register') {
						return $location.path('/dashboard');
					}
					// if not on active lecture, unsync socket listening for questions
					if (toState.url !== '/session/active/:sessionid') {
						socket.unsyncUpdates('session');

						if (toState.url === '/modules/:moduleid') {
							var moduleid = toParams.moduleid;

							Module.getByID(moduleid).then(function() {
								if (!(Auth.isAdmin() || Auth.isTutor())) {
									event.preventDefault();
									return $location.path('/session/register');
								}
							}).catch(function() {
								event.preventDefault();
								if (Auth.isAdmin() || Auth.isTutor()) {
									return $location.path('/modules');
								} else {
									return $location.path('/session/register');
								}
							});

						}
					} else {
						if (!toParams.sessionid) {
							event.preventDefault();
							if (Auth.isAdmin()) {
								return $location.path('/session/start?m=notReady');
							} else {
								return $location.path('/session/register?m=notReady');
							}
						}
						var sessionid = toParams.sessionid;
						var now = moment.utc();
						var _second = 1000;
						var _minute = _second * 60;
						// don't want user accessing page if session isn't valid
						Session.getOne(sessionid).then(function(res) {
							if (!res) {
								event.preventDefault();
								if (Auth.isAdmin()) {
									return $location.path('/session/start?m=notExist');
								} else {
									return $location.path('/session/register?m=notExist');
								}
							}

							var start = moment(res.startTime) - (res.timeAllowance * _minute);
							var end = moment(res.endTime) + (res.timeAllowance * _minute);

							// if session isn't between goalposts kick back to session start
							if (!(now >= start && now <= end)) {
								// console.info(Auth.isAdmin());
								if (Auth.isAdmin()) {
									return $location.path('/session/start?m=notReady');
								} else {
									return $location.path('/session/register?m=notReady');
								}
							}
						});
					}
				} else {
					// strangely can't soft route? so doing hard refresh
					if ($location.path() !== '/') {
						return $window.location.href = '/';
					}
				}
			});
		});
	})
	.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
		cfpLoadingBarProvider.includeSpinner = false;
		// cfpLoadingBarProvider.parentSelector = '#page-head';
		cfpLoadingBarProvider.latencyThreshold = 10;
	}])
	.config(function($mdThemingProvider) {
		var customPrimary = {
			'50': '#dde9f1',
			'100': '#caddea',
			'200': '#b8d1e2',
			'300': '#a6c5db',
			'400': '#94bad3',
			'500': '#82AECC',
			'600': '#70a2c5',
			'700': '#5e97bd',
			'800': '#4c8bb6',
			'900': '#437da5',
			'A100': '#eff4f8',
			'A200': '#ffffff',
			'A400': '#ffffff',
			'A700': '#3c6f93'
		};
		$mdThemingProvider
			.definePalette('customPrimary',
				customPrimary);

		var customAccent = {
			'50': '#010101',
			'100': '#0c0d10',
			'200': '#161a1f',
			'300': '#21262e',
			'400': '#2c333c',
			'500': '#363f4b',
			'600': '#4c5869',
			'700': '#566578',
			'800': '#617286',
			'900': '#6c7e95',
			'A100': '#4c5869',
			'A200': '#414C5A',
			'A400': '#363f4b',
			'A700': '#7b8ba0'
		};
		$mdThemingProvider
			.definePalette('customAccent',
				customAccent);

		var customWarn = {
			'50': '#ff8080',
			'100': '#ff6666',
			'200': '#ff4d4d',
			'300': '#ff3333',
			'400': '#ff1a1a',
			'500': '#FF0000',
			'600': '#e60000',
			'700': '#cc0000',
			'800': '#b30000',
			'900': '#990000',
			'A100': '#ff9999',
			'A200': '#ffb3b3',
			'A400': '#ffcccc',
			'A700': '#800000'
		};
		$mdThemingProvider
			.definePalette('customWarn',
				customWarn);

		var customBackground = {
			'50': '#ffffff',
			'100': '#ffffff',
			'200': '#ffffff',
			'300': '#ffffff',
			'400': '#ffffff',
			'500': '#F5F5F5',
			'600': '#e8e8e8',
			'700': '#dbdbdb',
			'800': '#cfcfcf',
			'900': '#c2c2c2',
			'A100': '#ffffff',
			'A200': '#ffffff',
			'A400': '#ffffff',
			'A700': '#b5b5b5'
		};
		$mdThemingProvider
			.definePalette('customBackground',
				customBackground);

		$mdThemingProvider.theme('default')
			.primaryPalette('customPrimary')
			.accentPalette('customAccent')
			.warnPalette('customWarn')
			.backgroundPalette('customBackground')
	})
	.run(function($rootScope, $location, Auth) {
		// Redirect to login if route requires auth and you're not logged in
		$rootScope.$on('$stateChangeStart', function(event, toState /*, toParams, fromState, fromParams*/ ) {
			Auth.isLoggedInAsync(function(loggedIn) {
				if ((toState.authenticate && !loggedIn)) {
					event.preventDefault();
					$location.path('/login');
				}
			});
		});
	});