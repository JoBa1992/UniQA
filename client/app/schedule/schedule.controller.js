'use strict';

angular.module('uniQaApp')
	.controller('ScheduleCtrl', function($scope, $http, $window, Auth, Session, Modal) {

		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

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