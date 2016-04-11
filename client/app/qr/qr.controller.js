'use strict';

angular.module('uniQaApp')
	.controller('QrRegistrationCtrl', function($scope, $location, $stateParams, Auth, Thing, Session) {

		// if user is logged in already, take them straight to the lecture
		if (!_.isEmpty(Auth.getCurrentUser())) {
			return $location.path('/session/active/' + $stateParams.sessionid);
		}

		// else allow them to login, and get redirected straight there instead

		$scope.user = {};
		// for quicker access, remove once finished
		$scope.user.email = 'b2006241@my.shu.ac.uk';
		$scope.errors = {};

		$scope.password = {};
		$scope.password.inputType = 'password';
		$scope.password.icon = 'glyphicon glyphicon-eye-close';



		Thing.getByName('uniEmail').then(function(val) {
			// only returns one element
			$scope.uniEmail = val.content[0];
		});
		Thing.getByName('uniName').then(function(val) {
			// only returns one element
			$scope.uniName = val.content[0];
		});

		$scope.togglePassInput = function() {
			if ($scope.password.inputType === 'password') {
				$scope.password.inputType = 'text';
				$scope.password.icon = 'glyphicon glyphicon-eye-open';
			} else {
				$scope.password.inputType = 'password';
				$scope.password.icon = 'glyphicon glyphicon-eye-close';
			}
		};

		$scope.login = function(form) {
			$scope.submitted = true;

			if (form.$valid) {
				Auth.login({
						email: $scope.user.email,
						password: $scope.user.password
					}).then(function() {
						var me;
						Auth.getCurrentUser().$promise.then(function(res) {
							me = res;

							Session.register({
								'user': me._id,
								'url': $location.path()
							}).then(function(res) {
								console.info(res);

								var now = moment.utc();
								var _second = 1000;
								var _minute = _second * 60;

								var start = moment(moment(res.startTime).utc() - (res.timeAllowance * _minute)).utc();
								var end = moment(moment(res.endTime).utc() + (res.timeAllowance * _minute)).utc();

								// if session isn't between goalposts kick back to session start
								if (now >= start && now <= end) {
									return $location.path('/session/active/' + $stateParams.sessionid);
								} else {
									return $location.path('/session/register?m=notReady');
								}

								// will be booted back if session isn't ready yet
							}).catch(function(err) {
								console.info(err);
								//display message on screen saying can't find
								return $location.path('/session/register?m=notExist');
							});
							// return $location.path('/session/active/' + $stateParams.sessionid);
						});
						// register doesn't work, it's sending through an undefined, which is logging in, but throwing user back to profile page
						// console.info($location.path);

					})
					.catch(function(err) {
						$scope.errors.other = err.message;
					});
			}
		};
	});