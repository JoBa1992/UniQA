'use strict';

angular.module('uniQaApp')
	.controller('ScheduleCtrl', function($scope, $http, $window, Auth, Session, Lecture, Module, Modal) {

		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.sForm = {
			lecture: '',
			startTime: '',
			endTime: '',
			allowance: '',
			group: ''
		};

		// disabled states for buttons on ui
		// $scope.schDelDisableBtn = 'disabled';
		// $scope.schCancelDisableBtn = 'disabled';
		// $scope.schAddSaveDisableBtn = 'disabled';

		$scope.dateConfig = {
			minuteStep: 5,
			startView: 'day',
			minView: 'minute'
		};

		// $scope.dpAria = false;

		$scope.windowHeight = $window.innerHeight - 52; // navbar + margin

		// $scope.cTime = new Date(); // get current date
		$scope.noQueryResults = false;

		$scope.myLectures = [];
		$scope.myGroups = [];
		$scope.selectedGroups = [];

		$scope.resultsPerPage = 200;
		$scope.currentPage = 1;
		// $scope.totalPages = 8;

		var me = Auth.getCurrentUser();

		var refreshSessions = function() {
			Session.getForMe({
				createdBy: me._id,
				paginate: $scope.resultsPerPage,
				page: $scope.currentPage
			}).then(function(res) {
				$scope.mySessions = res;
				$scope.mySessionCount = res.count === 0 ? 0 : res.count;
				$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
			});
		};

		refreshSessions();


		$scope.searchForMyGroup = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// form lecture contains the object that can be used when saving
				console.info($scope.sForm.lecture);
			} else {
				Group.getMyAssocGroups({
					title: $scope.sForm.lecture,
					createdBy: me._id,
					page: 1,
					paginate: 50
				}).then(function(res) {
					console.info(res.result);
					$scope.myLectures = res.result;
				});
			}
		};


		$scope.beforeRenderConfig = function($view, $dates /*, $leftDate, $upDate, $rightDate*/ ) {

			var currentDate = new Date();
			//var currentDateValue = currentDate.getTime();

			var yearViewDate = new Date(currentDate.getFullYear(), 0);
			var yearViewDateValue = yearViewDate.getTime();

			var monthViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
			var monthViewDateValue = monthViewDate.getTime();

			var dayViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
			var dayViewDateValue = dayViewDate.getTime();

			var hourViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours());
			var hourViewDateValue = hourViewDate.getTime();

			var minuteViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes());
			var minuteViewDateValue = minuteViewDate.getTime();

			for (var index = 0; index < $dates.length; index++) {
				var date = $dates[index];
				// Disable if it's in the past
				var dateValue = date.localDateValue();

				switch ($view) {
					case 'year':
						if (dateValue < yearViewDateValue) {
							date.selectable = false;
						}
						break;

					case 'month':
						if (dateValue < monthViewDateValue) {
							date.selectable = false;
						}
						break;

					case 'day':
						if (dateValue < dayViewDateValue) {
							date.selectable = false;
						}
						break;

					case 'hour':
						if (dateValue < hourViewDateValue) {
							date.selectable = false;
						}
						break;

					case 'minute':
						if (dateValue < minuteViewDateValue) {
							date.selectable = false;
						}
						break;
				}
			}
		};

		$scope.startTimeSelect = function(newDate) {
			var startDate = moment.utc([newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes()]);
			var endDate = moment.utc([newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes()]);

			$scope.sForm.startTimeMoment = startDate;
			$scope.sForm.startTime = startDate.format('DD/MM/YYYY HH:mm');

			// set endtime for convenience
			$scope.sForm.endTimeMoment = moment.utc(endDate.add(1, 'hour'));
			$scope.sForm.endTime = $scope.sForm.endTimeMoment.format('DD/MM/YYYY HH:mm');

			angular.element(document.querySelector('#startTimeDropdown')).removeClass('open');
			// doesn't work
			angular.element(document.querySelector('a.dropdown-toggle')).attr('aria-expanded', 'false');
		};

		$scope.endTimeSelect = function(newDate) {
			var endDate = moment.utc([newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes()]);
			$scope.sForm.endTimeMoment = endDate;
			$scope.sForm.endTime = $scope.sForm.endTimeMoment.format('DD/MM/YYYY HH:mm');

			angular.element(document.querySelector('#endTimeDropdown')).removeClass('open');
			// doesn't work
			angular.element(document.querySelector('a.dropdown-toggle')).attr('aria-expanded', 'false');
		};

		// $scope.startTimeSelect(moment.utc());


		$scope.searchForMyLectures = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// form lecture contains the object that can be used when saving
				console.info($scope.sForm.lecture);
			} else {
				// for no value
				// $scope.sForm.lecture = $scope.sForm.lecture || '';
				// console.info($scope.sForm.lecture);
				Lecture.getForMe({
					title: $scope.sForm.lecture,
					createdBy: me._id,
					page: 1,
					paginate: 50
				}).then(function(res) {
					$scope.myLectures = res.result;
				});
			}
		};

		// $scope.addSaveSchedule = function() {
		// 	if (formAddSaveBtn === 'Add') {
		// 		// begin creation
		//
		// 	} else {
		// 		// else update
		// 	}
		// };

		$scope.removeGroup = function(group) {
			// console.info(group);
			for (var item in $scope.selectedGroups) {
				if ($scope.selectedGroups[item] === group) {
					$scope.selectedGroups.splice(group, 1);
				}
			}
		};

		$scope.searchForMyGroups = function(e) {
			// console.info(e);
			// checking length to see if id has been sent through
			if (e.keyCode === 13 || e === 'Submit' || e._id) {
				// console.info($scope.myGroups);
				// if name isn't on the list, break out of function
				if ($scope.myGroups.length === 0) {
					return;
				} else {
					// need to either get selected here, or select first
					if (!($scope.sForm.group instanceof Object)) {
						if (e === 'Submit') {
							// gets index of child with active class from typeahead property
							/*jshint -W109 */
							$scope.sForm.group = $scope.myGroups[angular.element(document.querySelector("[id*='typeahead']")).find('.active').index()];
						}
					}
				}

				// only add if we have a collaborator
				if ($scope.sForm.group instanceof Object) {
					$scope.selectedGroups.push($scope.sForm.group);
				}
				$scope.myGroups = [];
				$scope.sForm.group = '';
			} else {
				Group.getMyAssocGroups({
					user: me._id,
					search: $scope.sForm.group
				}).then(function(res) {
					// reset before continuing
					$scope.myGroups = [];
					// filter through myGroups here, check against already existing collaborators and only allow them to stay if they don't exist
					for (var x = 0; x < res.groups.length; x++) {
						var isIn = false;
						for (var y = 0; y < $scope.selectedGroups.length; y++) {
							if (res.groups[x]._id === $scope.selectedGroups[y]._id) {
								isIn = true;
							}
						}
						if (!isIn) {
							$scope.myGroups.push(res.groups[x]);
						}
					}
					// console.info($scope.myGroups);
				});
			}

		};

		$scope.clearSchedForm = function() {
			$scope.sForm = {
				lecture: '',
				startTime: '',
				endTime: '',
				allowance: '',
				group: ''
			};
			$scope.selectedGroups = [];
		};
		$scope.openUpdateDelSessionModal = Modal.update.session(function(session) {
			// when modal is confirmed, callback
			if (session) {
				Session.remove(session._id).then(function(res) {
					console.info(res);
					refreshSessions();
				});
			}
		});

		// $scope.openUpdateDelSessionModal = Modal.update.session() {
		// 	$scope.sForm = {
		// 		lecture: '',
		// 		startTime: '',
		// 		endTime: '',
		// 		allowance: '',
		// 		group: ''
		// 	}
		// 	$scope.selectedGroups = [];
		// };

		$scope.addSchedule = function() {
			// console.info($scope.sForm);
			// console.info($scope.selectedGroups);
			$scope.submitted = true;
			if ($scope.sForm.lecture && $scope.sForm.startTime && $scope.sForm.endTime && !_.isEmpty($scope.selectedGroups)) {
				// setup vars to be sent across to API
				var presGroups = [];
				// push each selected collaborator into array
				for (var i = 0; i < $scope.selectedGroups.length; i++) {
					presGroups.push({
						group: $scope.selectedGroups[i]._id
					});
				}

				var data = {
					createdBy: me._id,
					lecture: $scope.sForm.lecture._id,
					startTime: moment.utc($scope.sForm.startTimeMoment).toISOString(),
					endTime: moment.utc($scope.sForm.endTimeMoment).toISOString(),
					groups: presGroups,
					timeAllowance: $scope.sForm.allowance
				};

				Session.createSession({
						data: data
					})
					.then(function(res) {
						console.info(res);
						refreshSessions();
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

	});