'use strict';

angular.module('uniQaApp')
	.controller('DropZoneController', function($scope) {
		$scope.dropzoneConfig = {
			'options': { // passed into the Dropzone constructor
				'url': 'upload.php'
			},
			// 'eventHandlers': {
			// 	'sending': function(file, xhr, formData) {},
			// 	'success': function(file, response) {}
			// }
		};
	});
// .controller('DropZoneController', ['$log', function($log) {
// 	var self = this;
//
// 	self.dzAddedFile = function(file) {
// 		$log.log(file);
// 	};
//
// 	self.dzError = function(file, errorMessage) {
// 		$log.log(errorMessage);
// 	};
//
// 	self.dropzoneConfig = {
// 		parallelUploads: 3,
// 		maxFileSize: 30
// 	};
// }]);