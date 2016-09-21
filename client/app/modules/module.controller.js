'use strict';

angular.module('UniQA')
	.controller('ModuleCtrl', function($rootScope, $scope, $http, $location, $stateParams, Auth, Module, Modal) {
		$rootScope.pageHeadTitle = 'Module Mgr / this module';
		$rootScope.showTopNav = true;
		$rootScope.navType = 'module';

		$scope.module = {};

		Module.getByID($stateParams.moduleid).then(function(res) {
			$scope.module = res;
		});

		$scope.openDeleteModal = Modal.delete.module(function(module) {
			//   // when modal is confirmed, callback
			if (module) {
				Module.remove({
					id: module._id
				});
			}
		});
	});