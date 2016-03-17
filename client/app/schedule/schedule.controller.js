'use strict';

angular.module('uniQaApp')
	.controller('ScheduleCtrl', function($scope, $http, $window, Auth, Session, Lecture, Group) {

		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$scope.sForm = {
			lecture: '',
			start: '',
			end: '',
			allowance: '',
			group: '',
			presTo: []
		}

		$scope.windowHeight = $window.innerHeight - 52; // navbar + margin

		$scope.formAddSaveBtn = 'Add';

		// $scope.cTime = new Date(); // get current date
		$scope.noQueryResults = false;

		$scope.mySessions = {};
		$scope.resultsPerPage = 10;
		$scope.currentPage = 1;
		// $scope.totalPages = 8;

		var me = Auth.getCurrentUser();

		Session.getForMe({
			author: me._id
		}).then(function(res) {
			$scope.mySessions = res;
			$scope.mySessionCount = res.count === 0 ? 0 : res.count;
			$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
		});

		// Lecture.getForMe({
		// 	createdBy: me._id,
		// 	page: 1,
		// 	paginate: 50
		// }).then(function(res) {
		// 	console.info(res);
		// 	$scope.myLectures = res.result;
		// });

		$scope.searchForMyGroup = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode == 13 || e == 'Submit' || e._id) {
				// form lecture contains the object that can be used when saving
				console.info($scope.sForm.lecture);
			} else {
				// for no value
				// $scope.sForm.lecture = $scope.sForm.lecture || '';
				// console.info($scope.sForm.lecture);
				Group.getMyAssocGroups({
					title: $scope.sForm.lecture,
					createdBy: me._id,
					page: 1,
					paginate: 50
				}).then(function(res) {
					console.info(res.result);
					// reset before continuing
					$scope.myLectures = res.result;
					// filter through possibleCollaborators here, check against already existing collaborators and only allow them to stay if they don't exist

					// for (var x = 0; x < res.collaborators.length; x++) {
					// 	var isIn = false;
					// 	for (var y = 0; y < $scope.myLectures.length; y++) {
					// 		if (res.collaborators[x]._id == $rootScope.selectedCollaborators[y]._id) {
					// 			isIn = true;
					// 		}
					// 	}
					// 	if (!isIn) {
					// 		$rootScope.possibleCollaborators.push(res.collaborators[x]);
					// 	}
					// }
				});
			}
		};


		$scope.searchForMyLectures = function(e) {
			// checking length to see if id has been sent through
			if (e.keyCode == 13 || e == 'Submit' || e._id) {
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
					console.info(res.result);
					// reset before continuing
					$scope.myLectures = res.result;
					// filter through possibleCollaborators here, check against already existing collaborators and only allow them to stay if they don't exist

					// for (var x = 0; x < res.collaborators.length; x++) {
					// 	var isIn = false;
					// 	for (var y = 0; y < $scope.myLectures.length; y++) {
					// 		if (res.collaborators[x]._id == $rootScope.selectedCollaborators[y]._id) {
					// 			isIn = true;
					// 		}
					// 	}
					// 	if (!isIn) {
					// 		$rootScope.possibleCollaborators.push(res.collaborators[x]);
					// 	}
					// }
				});
			}
		};

		// need a function thats smart enough to tell wether the user wants to save or add a scheduled item

		// addSaveSchedule
		/*

		$scope.refreshLectures = function(pageRequest) {
			if ($scope.currentPage > 1 && !pageRequest) {
				$scope.currentPage = 1;
			}
			Lecture.getForMe({
				createdBy: me._id,
				page: $scope.currentPage,
				paginate: $scope.resultsPerPage
			}).then(function(res) {
				// reset this once filters are used. Need to look at removing this object altogether
				if (res.count === 0) {
					//no results
					$scope.noQueryResults = true;
				} else {
					$scope.myLectures = res;
					//   console.info(res);
				}
			});
		};
		var refreshLectureStats = function() {
			Lecture.getMyTotal({
				createdBy: me._id
			}).then(function(res) {
				$scope.myLectureCount = res.count === 0 ? 0 : res.count;
				$scope.totalPages = Math.ceil(res.count / $scope.resultsPerPage);
			});
		};

		$scope.changePaginationPage = function(page) {
			if (page !== $scope.currentPage && page > 0 && page <= $scope.totalPages) {
				$scope.currentPage = page;
				$scope.refreshLectures(true);
			}
		};

		Lecture.getForMe({
			createdBy: me._id,
			page: $scope.currentPage,
			paginate: $scope.resultsPerPage
		}).then(function(res) {
			// reset this once filters are used. Need to look at removing this object altogether
			if (res.count === 0) {
				//no results
				$scope.noQueryResults = true;
			} else {
				$scope.myLectures = res;
				console.info(res);
			}
		});
		//
		// $scope.isDisabledDate = function(currentDate, mode) {
		//   return mode === 'day' && (currentDate.getDay() === 0 || currentDate.getDay() === 6);
		// };

		$scope.openCreateLectureModal = Modal.create.lecture(function() { // callback when modal is confirmed
			$scope.refreshLectures();
			refreshLectureStats();
		});
		$scope.openUpdateLectureModal = Modal.update.lecture(function() { // callback when modal is confirmed
			$scope.refreshLectures();
		});
		$scope.openDeleteLectureModal = Modal.delete.lecture(function(lecture) {
			// when modal is confirmed, callback
			if (lecture) {
				Lecture.remove({
					_id: lecture._id
				});
				$scope.refreshLectures();
				refreshLectureStats();
			}
		});

		$scope.editMinutes = function(datetime, minutes) {
			return new Date(datetime).getTime() + minutes * 60000;
		};*/
	});