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

		$scope.moduleSearchTerm = '';
		$scope.lessonSearchTerm = '';

		$scope.availableModules;
		$scope.availableLessons;

		$scope.session = {
			moduleGroups: [],
			lesson: '',
			reference: '',
			startSessionQuestions: true,
			startSessionFeedback: true,
			runtime: []
		}

		Module.getMyAssocModules({
			user: me._id
		}).then(function(res) {
			$scope.availableModules = res.modules;
		});

		Lesson.getForMe({
			title: '', // for querying
			author: me._id,
			page: 1,
			paginate: 50
		}).then(function(res) {
			$scope.availableLessons = res.lessons;
		});

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

		// $scope.searchForMyModules = function(e) {
		// 	// console.info(e);
		// 	// checking length to see if id has been sent through
		// 	if (e.keyCode === 13 || e === 'Submit' || e._id) {
		// 		// console.info($scope.myModules);
		// 		// if name isn't on the list, break out of function
		// 		if ($scope.myModules.length === 0) {
		// 			return;
		// 		} else {
		// 			// need to either get selected here, or select first
		// 			if (!($scope.sForm.module instanceof Object)) {
		// 				if (e === 'Submit') {
		// 					// gets index of child with active class from typeahead property
		// 					/*jshint -W109 */
		// 					$scope.sForm.module = $scope.myModules[angular.element(document.querySelector("[id*='typeahead']")).find('.active').index()];
		// 				}
		// 			}
		// 		}
		//
		// 		// only add if we have a collaborator
		// 		if ($scope.sForm.module instanceof Object) {
		// 			$scope.selectedModules.push($scope.sForm.module);
		// 		}
		// 		$scope.myModules = [];
		// 		$scope.sForm.module = '';
		// 	} else {
		// 		Module.getMyAssocModules({
		// 			user: me._id,
		// 			search: $scope.sForm.module
		// 		}).then(function(res) {
		// 			// reset before continuing
		// 			$scope.myModules = [];
		// 			// filter through myModules here, check against already existing collaborators and only allow them to stay if they don't exist
		// 			for (var x = 0; x < res.modules.length; x++) {
		// 				var isIn = false;
		// 				for (var y = 0; y < $scope.selectedModules.length; y++) {
		// 					if (res.modules[x]._id === $scope.selectedModules[y]._id) {
		// 						isIn = true;
		// 					}
		// 				}
		// 				if (!isIn) {
		// 					$scope.myModules.push(res.modules[x]);
		// 				}
		// 			}
		// 			// console.info($scope.myModules);
		// 		});
		// 	}
		// };

		$scope.createSession = function() {
			// create session in here
			$scope.submitted = true;

			if (!_.isEmpty($scope.session.moduleGroups) && $scope.session.lesson && !_.isEmpty($scope.session.runtime)) {
				// setup vars to be sent across to API
				var groups = [];
				// push each selected collaborator into array
				for (var i = 0; i < $scope.session.moduleGroups.length; i++) {
					groups.push({
						moduleGroup: $scope.session.moduleGroups[i]._id
					});
				}

				var data = {
					createdBy: me._id,
					lesson: $scope.session.lesson._id,
					reference: $scope.session.reference,
					runtime: [{
						start: moment.utc().toISOString(),
						end: moment.utc().add(1, 'hour').toISOString()
					}],
					groups: groups
				};

				Session.createSession(data)
					.then(function(res) {
						console.info(res);
						// refreshSessions();
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