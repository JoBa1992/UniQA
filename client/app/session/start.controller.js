'use strict';

angular.module('UniQA')
	.controller('SessionStartCtrl', function($rootScope, $scope, $window, $timeout, $sce, $interval, socket, Auth, Lesson, Module, Session) {
		// attach lodash to scope
		$scope._ = _;

		$rootScope.showTopNav = true;
		$rootScope.pageHeadTitle = '';

		// attach moment to scope
		$scope.moment = moment;

		var me = Auth.getCurrentUser();

		// variables used by countdown...
		$scope.now = moment.utc();

		$scope.submitted = false;

		// default active
		$scope.startSessionQuestions = 'success';
		$scope.startSessionFeedback = 'success';

		// var _second = 1000;
		// var _minute = _second * 60;
		// var _hour = _minute * 60;
		// var _day = _hour * 24;
		// var interval = 100;

		// Module.getMyAssocModules({
		// 	title: $scope.sForm.lesson,
		// 	author: me._id,
		// 	page: 1,
		// 	paginate: 50
		// }).then(function(res) {
		// 	console.info(res.result);
		// 	$scope.myLessons = res.result;
		// });

		$scope.searchForMyLessons = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// form lesson contains the object that can be used when saving
				// console.info($scope.sForm.lesson);
			} else {
				// for no value
				// $scope.sForm.lesson = $scope.sForm.lesson || '';
				// console.info($scope.sForm.lesson);
				Lesson.getForMe({
					title: $scope.sForm.lesson,
					author: me._id,
					page: 1,
					paginate: 50
				}).then(function(res) {
					$scope.myLessons = res.result;
				});
			}
		};

		$scope.searchForMyModules = function(e) {
			// console.info(e);
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// console.info($scope.myModules);
				// if name isn't on the list, break out of function
				if ($scope.myModules.length === 0) {
					return;
				} else {
					// need to either get selected here, or select first
					if (!($scope.sForm.module instanceof Object)) {
						if (e === 'Submit') {
							// gets index of child with active class from typeahead property
							/*jshint -W109 */
							$scope.sForm.module = $scope.myModules[angular.element(document.querySelector("[id*='typeahead']")).find('.active').index()];
						}
					}
				}

				// only add if we have a collaborator
				if ($scope.sForm.module instanceof Object) {
					$scope.selectedModules.push($scope.sForm.module);
				}
				$scope.myModules = [];
				$scope.sForm.module = '';
			} else {
				Module.getMyAssocModules({
					user: me._id,
					search: $scope.sForm.module
				}).then(function(res) {
					// reset before continuing
					$scope.myModules = [];
					// filter through myModules here, check against already existing collaborators and only allow them to stay if they don't exist
					for (var x = 0; x < res.modules.length; x++) {
						var isIn = false;
						for (var y = 0; y < $scope.selectedModules.length; y++) {
							if (res.modules[x]._id === $scope.selectedModules[y]._id) {
								isIn = true;
							}
						}
						if (!isIn) {
							$scope.myModules.push(res.modules[x]);
						}
					}
					// console.info($scope.myModules);
				});
			}

		};

		$scope.switchQuestionState = function() {
			if ($scope.startSessionQuestions === 'success') {
				$scope.startSessionQuestions = 'default';
			} else {
				$scope.startSessionQuestions = 'success';
			}
		};

		$scope.switchFeedbackState = function() {
			if ($scope.startSessionFeedback === 'success') {
				$scope.startSessionFeedback = 'default';
			} else {
				$scope.startSessionFeedback = 'success';
			}
		};

		$scope.createSession = function() {
			// create session in here
			$scope.submitted = true;

			if ($scope.sForm.lesson && $scope.sForm.startTime && $scope.sForm.endTime && !_.isEmpty($scope.selectedModules)) {
				// setup vars to be sent across to API
				var presModules = [];
				// push each selected collaborator into array
				for (var i = 0; i < $scope.selectedModules.length; i++) {
					presModules.push({
						module: $scope.selectedModules[i]._id
					});
				}

				var data = {
					author: me._id,
					lesson: $scope.sForm.lesson._id,
					startTime: moment.utc($scope.sForm.startTimeMoment).toISOString(),
					endTime: moment.utc($scope.sForm.endTimeMoment).toISOString(),
					modules: presModules,
					timeAllowance: $scope.sForm.allowance
				};

				Session.createSession({
						data: data
					})
					.then(function(res) {
						console.info(res);
						// refreshSessions();
						$scope.clearSchedForm();
					})
					.catch(function(err) {
						$scope.errors = {};

						console.info(err);

						// Update validity of form fields that match the mongoose errors
						// angular.forEach(err.errors, function(error, field) {
						// 	//console.info(form[field]);
						// 	form[field].$setValidity('mongoose', false);
						// 	$scope.errors[field] = error.message;
						// });
					});
			}
		};

		// need function which creates the session, and on success sends the page to the newly created session. Need to block UI input throughout this faze, and show a loading animation

	})