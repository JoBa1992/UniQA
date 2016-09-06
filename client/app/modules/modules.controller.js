'use strict';

angular.module('uniQaApp')
	.controller('ModulesCtrl', function($scope, $http, $location, Auth, Module, Modal) {
		$scope.title = 'Module Management';

		$scope.moduleOption = 'User';

		// Check for when query returns no modules
		$scope.isEmpty = function(obj) {
			//   console.info(obj);
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					return false;
				}
			}
			return true;
		};

		Module.get().then(function(res) {
			$scope.modules = res.modules;
			$scope.count = res.count;
		});

		$scope.routeToModuleChild = function(id) {
			$location.path('/modules/' + id);
		};

		$scope.isModuleOptionActive = function(param) {
			if ($scope.moduleOption === param) {
				return true;
			}
			return false;
		};

		$scope.changeModuleSubNav = function(newVal) {
			$scope.moduleOption = newVal;
		};

		$scope.openCreateModal = Modal.create.module(function(createModule) {
			$location.path('/modules/' + createModule._id);
		});
	});