angular.module('UniQA')
	.controller('RuntimeCreateModalCtrl', function($scope, $window, Thing, Module, Modal) {
		$scope.minToDate;
		var currentDate = new Date();
		// Thing.getByName('uniTimePeriods').then(function(res) {
		// 	console.info(res);
		// 	for (var item in res.content[0]) {
		// 		console.info(moment.utc(res.content[0][item].start).local().format("DD/MM/YYYY HH:mm"));
		// 		console.info(moment.utc(res.content[0][item].end).local().format("DD/MM/YYYY HH:mm"));
		// 	}
		// });
		// console.info(moment('28/08/2016 00:00', 'DD/MM/YYYY HH:mm').utc().toISOString());

		$scope.form = {
			fromDate: '',
			fromHr: '',
			fromMin: '',
			toDate: '',
			toHr: '',
			toMin: ''
		};

		$scope.minDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() - 2,
			currentDate.getDate()
		);

		$scope.maxDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 2,
			currentDate.getDate()
		);

		$scope.onlyWeekdaysPredicate = function(date) {
			var day = date.getDay();
			return day !== 0 && day !== 6;
		};

		$scope.checkToInput = function() {
			$scope.minToDate = new Date(
				$scope.form.fromDate.getFullYear(),
				$scope.form.fromDate.getMonth(),
				$scope.form.fromDate.getDate()

			);
			changeToIfEmpty();
		}

		var changeToIfEmpty = function() {
			if (_.isEmpty($scope.form.toDate) || $scope.form.toDate === '' ||
				($scope.form.fromDate > $scope.form.toDate)) {
				$scope.form.toDate = new Date($scope.form.fromDate);
			}
		}
	});