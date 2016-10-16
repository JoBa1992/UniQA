'use strict';

angular.module('UniQA')
	.controller('LessonCtrl', function($scope, $stateParams, $location, $mdToast, Auth, Lesson, Module, Modal) {
		$scope.lesson = {};
		$scope.lessonLoaded = false;
		$scope.editState = false;

		$scope.me = Auth.getCurrentUser();

		var last = {
			bottom: true,
			top: false,
			left: false,
			right: true
		};

		var originatorEv;

		$scope.toastPosition = angular.extend({}, last);

		$scope.getToastPosition = function() {
			sanitizePosition();

			return Object.keys($scope.toastPosition)
				.filter(function(pos) {
					return $scope.toastPosition[pos];
				})
				.join(' ');
		};

		function sanitizePosition() {
			var current = $scope.toastPosition;

			if (current.bottom && last.top) current.top = false;
			if (current.top && last.bottom) current.bottom = false;
			if (current.right && last.left) current.left = false;
			if (current.left && last.right) current.right = false;

			last = angular.extend({}, current);
		}

		var showUndoDeleteToast = function(id) {
			var pinTo = $scope.getToastPosition();
			var toast = $mdToast.simple()
				.textContent('Lesson deleted')
				.action('UNDO')
				.highlightAction(true)
				.highlightClass('md-primary')
				.hideDelay(5000)
				.position(pinTo);

			$mdToast.show(toast).then(function(response) {
				if (response == 'ok') {
					Lesson.undoDelete(id).then(function() {
						// need to figure out how to refresh lessons in new view on lessonsList controller
						// refreshLessons();
					});
				}
			});
		}

		var showUpdateSuccessToast = function(id) {
			var pinTo = $scope.getToastPosition();
			var toast = $mdToast.simple()
				.textContent('Lesson updated')
				.hideDelay(2000)
				.position(pinTo)
				.theme('success-toast') // temp hack;

			$mdToast.show(toast);
		}

		var updateLesson = function() {
			console.info("Updating Lesson");
			showUpdateSuccessToast();
		};

		Module.getMyAssocModules({
			user: $scope.me._id
		}).then(function(res) {
			$scope.availableModules = res.modules;
		});

		Lesson.getByID($stateParams.lessonid).then(function(res) {
			$scope.lessonLoaded = true;
			$scope.lesson = res;
			console.info(res);
		});

		$scope.toggleEditState = function() {
			if ($scope.editState) {
				updateLesson();
			}
			return $scope.editState = !$scope.editState;
		}

		$scope.openDeleteModal = Modal.delete.lesson(function(lesson) {
			//   when modal is confirmed, callback
			if (lesson) {
				Lesson.remove(lesson._id, function() {
					showUndoDeleteToast(lesson._id);
					$location.path('lessons');
				});
			}
		});
	});