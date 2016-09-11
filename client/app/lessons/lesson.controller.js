'use strict';

angular.module('UniQA')
	.controller('LessonCtrl', function($rootScope, $scope, $http, $stateParams, Auth, Lesson, Modal) {
		// attach lodash to scope
		$scope._ = _;

		$rootScope.pageHeadTitle = 'Lesson Management';
		$rootScope.showTopNav = true;


		Lesson.getByID($stateParams.lessonid).then(function(res) {
			$scope.lesson = res;
			$rootScope.pageHeadTitle = 'Lesson Management / ' + res.title;
			console.info(res);
		});

		$scope.filter = {
			searchStr: ''
		};

		var me = Auth.getCurrentUser();
		$scope.currentPage = 1;
		$scope.paginate = 50;

		var refreshLessons = function() {
			Lesson.getForMe({
				title: $scope.filter.searchStr,
				createdBy: me._id,
				page: $scope.currentPage,
				paginate: $scope.resultsPerPage
			}).then(function(res) {
				// console.info(res);
				// reset this once filters are used. Need to look at removing this object altogether
				if (res.count === 0) {
					//no results
					$scope.noQueryResults = true;
				} else {
					// set init state of hover event on each lesson
					for (var lesson in res.result) {
						res.result[lesson].preHover = false;

						for (var files in res.result[lesson].attachments) {
							res.result[lesson].attachments[files].filename = res.result[lesson].attachments[files].loc.split('/').pop();
						}
					}

					$scope.lessons = res.result;
					$scope.myLessonCount = res.count;
				}
			});
		};

		refreshLessons();

		$scope.searchStrFilter = function() {
			refreshLessons();
		};

		$scope.openCreateModal = Modal.create.lesson(function() {
			refreshLessons();
		});

		$scope.openPreviewLessonModal = Modal.read.lesson(function() {

		});

		$scope.openDeleteModal = Modal.delete.lesson(function(lesson) {
			// when modal is confirmed, callback
			if (lesson) {
				Lesson.remove(lesson._id).then(function() {
					refreshLessons();
				});
			}
		});

		$scope.checkForSubmit = function(e) {
			if (e.keyCode === 13) {
				$scope.refreshLessons();
			}
		};

		$scope.isMyLesson = function(lectAuthor) {
			return me._id === lectAuthor;
		};

		//
		// Lesson.getForMe({
		//     createdBy: me._id,
		//     page: $scope.currentPage,
		//     paginate: $scope.resultsPerPage
		// }).then(function(res) {
		// 	var lesson = res.lesson;
		// 	var groups = res.groups;
		// 	var questions = res.questions;
		// 	var authorCollabs = [];
		// 	var runtime;
		//
		// 	authorCollabs.push(lesson.author.name); // push author in first
		// 	// push in collabs
		// 	for (var i = 0; i < lesson.collaborators.length; i++) {
		// 		authorCollabs.push(lesson.collaborators[i].user.name);
		// 	}
		//
		// 	runtime = moment(res.startTime).utc().format("HH:mm") + ' - ' + moment(res.endTime).utc().format("HH:mm")
		//
		//
		// 	console.info(runtime);
		//
		// 	// for animated loading
		// 	$timeout(function() {
		// 		$scope.lesson['title'] = lesson.title;
		// 		$scope.lesson['desc'] = lesson.desc;
		// 		$scope.lesson['url'] = lesson.url;
		// 		$scope.lesson['questions'] = questions;
		// 		$scope.lesson['runTime'] = runtime;
		// 		$scope.lesson['collaborators'] = authorCollabs;
		// 		$scope.lesson['registered'] = ['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog'];
		// 		$scope.lesson['expected'] = 15;
		// 		$scope.lesson['resources'] = lesson.attachments;
		// 		$scope.init = true;
		// 	}, 500);
		// });

	});