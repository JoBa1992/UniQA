'use strict';

angular.module('UniQA')
	.controller('DashboardCtrl', function($rootScope, $scope, $location, Auth, Session, Modal) {
		// attach lodash to scope
		$scope._ = _;
		// attach moment to scope
		$scope.moment = moment;

		$rootScope.showTopNav = false;

		$scope.me = Auth.getCurrentUser();
		// temporary until student profile is sorted
		if ($scope.me.role === 'student') {
			$location.path('/session/register');
		}

		// used to swap sides on css
		$scope.inverter = false;

		$scope.canLoadMore = true;
		$scope.timelineIcon = 'fa fa-arrow-circle-o-down';

		$scope.myFeedback = [];

		var page = 1;
		var pag = 10;

		var me = Auth.getCurrentUser();

		$scope.loadMoreFeedback = function() {
			$scope.canLoadMore = false;
			$scope.timelineIcon = 'fa fa-refresh rotating';
			Session.getForMe({
				author: me._id,
				historic: true,
				order: '-startTime',
				page: page,
				paginate: pag
			}).then(function(res) {
				$scope.timelineIcon = 'fa fa-arrow-circle-o-down';
				if (res.length === 0) {
					$scope.timelineIcon = 'fa fa-road';
					$scope.canLoadMore = false;
					return;
				} else {
					// attach expected number to each object inside response
					_.some(res, function(session) {
						session.expected = 0;
						//session.mostDownloaded; // set to null;
						console.info(session);
						_.some(session.modules, function(module) {
							// bad nesting due to dodgy model, needs checking
							session.expected += module.module.students.length;
						});

					});

					// attach average rating to each object inside response
					_.some(res, function(session) {
						// averages numbers inside feedback, returns avg
						session.avgRating = avgFeedback(session.feedback);
					});

					for (var i = 0; i < res.length; i++) {
						$scope.myFeedback.push(res[i]);
					}

					if (res.length !== pag) {
						$scope.timelineIcon = 'fa fa-road';
						$scope.canLoadMore = false;
					} else {
						page++;
						$scope.canLoadMore = true;
					}


				}
			}).catch(function(err) {
				console.info(err);
				$scope.timelineIcon = 'fa fa-road';
				$scope.canLoadMore = false;
				return;
			});
		};


		$scope.loadMoreFeedback();

		function avgFeedback(arr) {
			return _.reduce(arr, function(num, memo) {
				return num + parseFloat(memo.rating);
			}, 0) / (arr.length === 0 ? 1 : arr.length);
		}

		$scope.viewFeedback = Modal.read.feedback(function() {
			// callback when modal is confirmed
			// refreshUserStats();
			// $scope.refreshUserList();
		});
	});