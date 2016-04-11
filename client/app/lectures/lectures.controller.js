'use strict';

angular.module('uniQaApp')
	.controller('LectureTutCtrl', function($scope, $http, Auth, Lecture, Modal) {
		// attach lodash to scope
		$scope._ = _;

		$scope.title = 'My Lectures';

		$scope.filter = {
			searchStr: ''
		};

		var me = Auth.getCurrentUser();
		$scope.currentPage = 1;
		$scope.paginate = 50;

		var refreshLectures = function() {
			Lecture.getForMe({
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
					// set init state of hover event on each lecture
					for (var lecture in res.result) {
						res.result[lecture].preHover = false;

						for (var files in res.result[lecture].attachments) {
							res.result[lecture].attachments[files].filename = res.result[lecture].attachments[files].loc.split('/').pop();
						}
					}

					$scope.lectures = res.result;
					$scope.myLectureCount = res.count;
				}
			});
		};

		refreshLectures();

		$scope.searchStrFilter = function() {
			refreshLectures();
		};

		$scope.openCreateLectureModal = Modal.create.lecture(function() {
			refreshLectures();
		});

		$scope.openpreviewLectureModal = Modal.read.lecture(function() {
			// refreshLectures();
		});

		$scope.openDeleteLectureModal = Modal.delete.lecture(function(lecture) {
			// when modal is confirmed, callback
			if (lecture) {
				Lecture.remove(lecture._id).then(function() {
					refreshLectures();
				});
			}
		});

		$scope.isMyLecture = function(lectAuthor) {
			return me._id === lectAuthor;
		};

		//
		// Lecture.getForMe({
		//     createdBy: me._id,
		//     page: $scope.currentPage,
		//     paginate: $scope.resultsPerPage
		// }).then(function(res) {
		// 	var lecture = res.lecture;
		// 	var groups = res.groups;
		// 	var questions = res.questions;
		// 	var authorCollabs = [];
		// 	var runtime;
		//
		// 	authorCollabs.push(lecture.author.name); // push author in first
		// 	// push in collabs
		// 	for (var i = 0; i < lecture.collaborators.length; i++) {
		// 		authorCollabs.push(lecture.collaborators[i].user.name);
		// 	}
		//
		// 	runtime = moment(res.startTime).utc().format("HH:mm") + ' - ' + moment(res.endTime).utc().format("HH:mm")
		//
		//
		// 	console.info(runtime);
		//
		// 	// for animated loading
		// 	$timeout(function() {
		// 		$scope.lecture['title'] = lecture.title;
		// 		$scope.lecture['desc'] = lecture.desc;
		// 		$scope.lecture['url'] = lecture.url;
		// 		$scope.lecture['questions'] = questions;
		// 		$scope.lecture['runTime'] = runtime;
		// 		$scope.lecture['collaborators'] = authorCollabs;
		// 		$scope.lecture['registered'] = ['This bit still needs sorting', 'John Bloomer', 'Fred Durst', 'Bob Ross', 'Jack McClone', 'Chadwick Simpson', 'Jonathon Dickson', 'Alexis Parks', 'Sandra Bates', 'Steve Bates', 'Bob the Dog'];
		// 		$scope.lecture['expected'] = 15;
		// 		$scope.lecture['resources'] = lecture.attachments;
		// 		$scope.init = true;
		// 	}, 500);
		// });

	});