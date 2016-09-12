'use strict';

angular.module('UniQA')
	.controller('LessonListCtrl', function($rootScope, $scope, $http, $mdToast, $location, Auth, Lesson, Modal) {
		// attach lodash to scope
		$scope._ = _;

		$rootScope.pageHeadTitle = 'Lesson Management';
		$rootScope.showTopNav = true;

		var last = {
			bottom: true,
			top: false,
			left: false,
			right: true
		};
		var originatorEv;

		$scope.toastPosition = angular.extend({}, last);

		$scope.filter = {
			searchStr: ''
		};

		var me = Auth.getCurrentUser();
		$scope.currentPage = 1;
		$scope.paginate = 100;

		var refreshLessons = function() {
			Lesson.getForMe({
				title: $scope.filter.searchStr,
				author: me._id,
				page: $scope.currentPage,
				paginate: $scope.resultsPerPage
			}).then(function(res) {
				// reset this once filters are used. Need to look at removing this object altogether
				if (res.count === 0) {
					//no results
					$scope.noQueryResults = true;
				} else {
					// set init state of hover event on each lesson
					for (var lesson in res.result) {
						for (var files in res.result[lesson].attachments) {
							res.result[lesson].attachments[files].filename = res.result[lesson].attachments[files].loc.split('/').pop();
						}
					}

					var moduleLessons = {};
					var lessonsWithoutModules = [];

					// construct results of arrays
					for (var lesson in res.result) {
						if (res.result[lesson].module && res.result[lesson].module.name) {
							if ((moduleLessons[res.result[lesson].module.name] === null ||
									moduleLessons[res.result[lesson].module.name] == undefined) ||
								moduleLessons[res.result[lesson].module.name].length < 1) {
								moduleLessons[res.result[lesson].module.name] = [];
							}
							moduleLessons[res.result[lesson].module.name].push(res.result[lesson]);
						} else {
							lessonsWithoutModules.push(res.result[lesson]);
						}
					}

					$scope.moduleLessons = sortLessonLists(moduleLessons);
					$scope.lessonsWithoutModules = sortLessonLists(lessonsWithoutModules);
				}
			});
		};
		refreshLessons();
		// sort internal sets
		var sortLessonLists = function(list) {
			if (list.length) {
				list.sort(function(a, b) {
					if (a.title < b.title)
						return -1;
					if (a.title > b.title)
						return 1;
					return 0;
				});
			} else {
				for (var item in list) {
					list[item].sort(function(a, b) {
						if (a.title < b.title)
							return -1;
						if (a.title > b.title)
							return 1;
						return 0;
					});
				}
			}
			return list;
		}

		$scope.searchStrFilter = function() {
			refreshLessons();
		};

		$scope.takeToLesson = function(id) {
			console.info(id);
		}

		$rootScope.openCreateModal = Modal.create.lesson(function() {
			refreshLessons();
		});

		$scope.openMoreLessonOptions = function($mdOpenMenu, ev) {
			originatorEv = ev;
			$mdOpenMenu(ev);
		}

		$scope.announceClick = function(index, lesson) {
			originatorEv = null;
			switch (index) {
				case ('edit'):
					$location.path('/lessons/' + lesson._id);
					break;
				case ('clone'):
					alert('Cloning - coming soon');
					console.info('feature needs implementing');
					break;
				case ('delete'):
					$scope.openDeleteModal(lesson);
					break;
				default:
					console.info('feature needs implementing');
					break;
			}
		};

		$scope.openDeleteModal = Modal.delete.lesson(function(lesson) {
			// when modal is confirmed, callback
			if (lesson) {
				Lesson.remove(lesson._id).then(function() {
					refreshLessons();
					$scope.showUndoDeleteToast();
				});
			}
		});

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
		$scope.showUndoDeleteToast = function() {
			var pinTo = $scope.getToastPosition();
			var toast = $mdToast.simple()
				.textContent('Lesson deleted')
				.action('UNDO')
				.highlightAction(true)
				.highlightClass('md-danger') // Accent is used by default, this just demonstrates the usage.
				.hideDelay(5000)
				.position(pinTo);

			$mdToast.show(toast).then(function(response) {
				if (response == 'ok') {
					alert('Go Call DB');
				}
			});
		}

		$scope.checkForSubmit = function(e) {
			if (e.keyCode === 13) {
				$scope.refreshLessons();
			}
		};

		$scope.isMyLesson = function(lectAuthor) {
			return me._id === lectAuthor;
		};
	});