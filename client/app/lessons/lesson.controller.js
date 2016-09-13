'use strict';

angular.module('UniQA')
	.controller('LessonCtrl', function($rootScope, $scope, $http, $stateParams, Auth, Lesson, Modal) {
		$rootScope.pageHeadTitle = 'Lesson Mgr / this lesson';
		$rootScope.showTopNav = true;
		$rootScope.pageHeadType = 'lesson';

		$scope.lesson = {};

		Lesson.getByID($stateParams.lessonid).then(function(res) {
			$scope.lesson = res;
		});

		$scope.openDeleteModal = Modal.delete.lesson(function(lesson) {
			//   // when modal is confirmed, callback
			if (lesson) {
				Lesson.remove({
					id: lesson._id
				});
			}
		});
	});