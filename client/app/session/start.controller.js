'use strict';

angular.module('UniQA')
	.controller('SessionStartCtrl', function($scope, $element, $location, Auth, Lesson, Module, Modal, Session) {
		// attach lodash to scope
		$scope._ = _;

		// attach moment to scope
		$scope.moment = moment;

		var me = Auth.getCurrentUser();

		$scope.submitted = false;

		$scope.moduleSearchTerm;
		$scope.lessonSearchTerm;
		$scope.availableModules;
		$scope.availableLessons;

		$scope.session = {
			moduleGroups: [],
			lesson: '',
			reference: '',
			startSessionQuestions: true,
			startSessionFeedback: true,
			runtime: [{
				start: moment().format("DD/MM/YYYY HH:mm"),
				end: moment().add(1, 'hour').format("DD/MM/YYYY HH:mm")
			}]
		}

		$scope.clearSearchTerm = function() {
			$scope.moduleSearchTerm = '';
			$scope.lessonSearchTerm = '';
		};

		// The md-select directive eats keydown events for some quick select
		// logic. Since we have a search input here, we don't need that logic.
		$element.find('input').on('keydown', function(ev) {
			ev.stopPropagation();
		});

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

		var goToSession = function(session) {
			return $location.path('/session/active/' + session._id);
		}

		$scope.searchForMyLessons = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// form lesson contains the object that can be used when saving
				// console.info($scope.sForm.lesson);
			} else {
				// for no value
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
		$scope.openAddRuntimeModal = Modal.create.runtime(function(res) {
			var start = moment(moment(res.fromDate).format("DD/MM/YYYY ") + res.fromHr + ":" + res.fromMin, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm");
			var end = moment(moment(res.toDate).format("DD/MM/YYYY ") + res.toHr + ":" + res.toMin, "DD/MM/YYYY HH:mm").format("DD/MM/YYYY HH:mm")
			$scope.session.runtime.push({
				start: start,
				end: end
			});
		});

		$scope.deleteRuntime = function(runtime) {
			var index = $scope.session.runtime.indexOf(runtime);
			if (index > -1) {
				$scope.session.runtime.splice(index, 1);
			}
		};

		$scope.isSessionStartDisabled = function() {
			if (!$scope.session.lesson || _.isEmpty($scope.session.moduleGroups) || _.isEmpty($scope.session.runtime)) {
				return true;
			}
			return false;
		};

		$scope.createSession = function() {
			// create session in here
			$scope.submitted = true;

			if (!_.isEmpty($scope.session.moduleGroups) && $scope.session.lesson && !_.isEmpty($scope.session.runtime)) {
				// setup vars to be sent across to API
				var groups = [];
				var runtimes = [];
				// push each selected collaborator into array
				for (var i = 0; i < $scope.session.moduleGroups.length; i++) {
					groups.push({
						moduleGroup: $scope.session.moduleGroups[i]._id
					});
				}
				for (var i = 0; i < $scope.session.runtime.length; i++) {
					runtimes.push({
						start: moment($scope.session.runtime[i].start, "DD/MM/YYYY HH:mm").toISOString(),
						end: moment($scope.session.runtime[i].end, "DD/MM/YYYY HH:mm").toISOString()
					});
				}


				var data = {
					createdBy: me._id,
					lesson: $scope.session.lesson._id,
					reference: $scope.session.reference,
					runTime: runtimes,
					questionsEnabled: $scope.session.startSessionQuestions,
					feedbackEnabled: $scope.session.startSessionFeedback,
					groups: groups
				};

				console.info('data', data);

				Session.createSession(data)
					.then(function(res) {
						console.info('res', res);
						goToSession(res);
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
	})