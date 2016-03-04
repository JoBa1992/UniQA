'use strict';

angular.module('uniQaApp')
	.directive('dropZone', function() {
		return {
			scope: {
				action: "@",
				autoProcess: "=?",
				callBack: "&?",
				dataMax: "=?",
				mimetypes: "=?",
				message: "@?",
			},
			link: function(scope, element, attrs) {
				// console.log("Creating dropzone");

				// Autoprocess the form
				if (scope.autoProcess != null && scope.autoProcess == "false") {
					scope.autoProcess = false;
				} else {
					scope.autoProcess = true;
				}

				// Max file size
				if (scope.dataMax == null) {
					scope.dataMax = Dropzone.prototype.defaultOptions.maxFilesize;
				} else {
					scope.dataMax = parseInt(scope.dataMax);
				}

				// Message for the uploading
				if (scope.message == null) {
					scope.message = Dropzone.prototype.defaultOptions.dictDefaultMessage;
				}

				element.dropzone({
					url: scope.action,
					maxFilesize: scope.dataMax,
					paramName: "file",
					acceptedFiles: scope.mimetypes,
					maxThumbnailFilesize: scope.dataMax,
					dictDefaultMessage: scope.message,
					autoProcessQueue: scope.autoProcess,
					success: function(file, response) {
						if (scope.callBack != null) {
							scope.callBack({
								response: response
							});
						}
					}
				});
			}
		}

		// return function(scope, element, attrs) {
		// 	var config, dropzone;
		//
		// 	// angular.forEach(attrs, function(value, key) {
		// 	// 	config = config[value];
		// 	// });
		//
		// 	config = scope[attrs.dropzone];
		//
		// 	// create a Dropzone for the element with the given options
		// 	dropzone = new Dropzone(element[0], config.options);
		//
		// 	// bind the given event handlers
		// 	angular.forEach(config.eventHandlers, function(handler, event) {
		// 		dropzone.on(event, handler);
		// 	});
		// };
	});