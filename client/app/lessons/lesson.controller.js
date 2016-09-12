'use strict';

angular.module('UniQA')
	.controller('LessonCtrl', function($rootScope, $scope, $http, $stateParams, Auth, Lesson, Modal) {
		// attach lodash to scope
		$scope._ = _;

		$rootScope.pageHeadTitle = 'Lesson Management';
		$rootScope.showTopNav = true;

		var refreshLesson = function() {
			Lesson.getByID($stateParams.lessonid).then(function(res) {
				$scope.lesson = res;
				$rootScope.pageHeadTitle = 'Lesson Management / ' + res.title;
				console.info(res);
			});
		}

		$scope.filter = {
			searchStr: ''
		};

		var me = Auth.getCurrentUser();
		$scope.currentPage = 1;
		$scope.paginate = 50;

		refreshLesson();

		$scope.searchStrFilter = function() {
			refreshLesson();
		};

		$scope.openCreateModal = Modal.create.lesson(function() {
			refreshLesson();
		});

		$scope.openPreviewLessonModal = Modal.read.lesson(function() {

		});

		$scope.openDeleteModal = Modal.delete.lesson(function(lesson) {
			// when modal is confirmed, callback
			if (lesson) {
				Lesson.remove(lesson._id).then(function() {
					refreshLesson();
				});
			}
		});

		$scope.checkForSubmit = function(e) {
			if (e.keyCode === 13) {
				$scope.refreshLesson();
			}
		};

		$scope.isMyLesson = function(lectAuthor) {
			return me._id === lectAuthor;
		};
	});