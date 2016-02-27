'use strict';

angular.module('uniQaApp')
	.controller('LectureTutCtrl', function($scope, $http, Auth, Lecture) {
		$scope.title = 'My Lectures';

		// Error handling for when query returns no users
		$scope.isEmpty = function(obj) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					return false;
				}
			}
			return true;
		};

		var me = Auth.getCurrentUser();
		$scope.currentPage = 1;
		$scope.paginate = 15;

		Lecture.getForMe({
			createdBy: me._id,
			page: $scope.currentPage,
			paginate: $scope.resultsPerPage
		}).then(function(res) {
			console.info(res);
			// reset this once filters are used. Need to look at removing this object altogether
			if (res.count === 0) {
				//no results
				$scope.noQueryResults = true;
			} else {
				$scope.lectures = res;
			}
		});
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