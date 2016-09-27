angular.module('UniQA')
	.controller('RuntimeCreateModalCtrl', function($scope, $window, Thing, Module, Modal) {
		$scope.myDate = new Date();
		Thing.getByName('uniTimePeriods').then(function(res) {
			console.info(res);
		});
		console.info(moment('28/08/2016 00:00', 'DD/MM/YYYY HH:mm').utc().toISOString());

		$scope.minDate = new Date(
			$scope.myDate.getFullYear(),
			$scope.myDate.getMonth() - 2,
			$scope.myDate.getDate());

		$scope.maxDate = new Date(
			$scope.myDate.getFullYear(),
			$scope.myDate.getMonth() + 2,
			$scope.myDate.getDate());

		$scope.onlyWeekendsPredicate = function(date) {
			var day = date.getDay();
			return day === 0 || day === 6;
		};
	});