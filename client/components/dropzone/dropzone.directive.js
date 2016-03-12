'use strict';

angular.module('uniQaApp')
	.directive('dropZone', function($rootScope) {
		return {
			scope: {
				action: "@",
				autoprocessdz: "=?",
				dzType: "=?",
				callBack: "&?",
				dataMax: "=?",
				mimetypes: "=?",
				message: "@?",
			},
			link: function(scope, element, attrs) {
				var iconType = '';
				// console.log("Creating dropzone");
				// Autoprocess the form
				if (scope.autoprocessdz == "true") {
					scope.autoProcess = true;
				} else {
					scope.autoProcess = false;
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

				//sort out which icon should be used in template
				if (scope.dzType == "csvImport") {
					iconType = "fa-file-text-o";
				}

				var previewTemp = "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\" style=\"width:100%;\"><span style=\"width:100%;\" data-dz-name> </span>\n<i style=\"color:#bbb;margin-top:.3em;width:100%;\" class=\"fa " + iconType + " fa-3x\"></i></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>";




				$rootScope.dropzone = element.dropzone({
					url: '/',
					maxFilesize: scope.dataMax,
					paramName: "file",

					acceptedFiles: scope.mimetypes,
					maxThumbnailFilesize: scope.dataMax,
					dictDefaultMessage: scope.message,
					autoProcessQueue: scope.autoProcess,
					previewTemplate: previewTemp,
					// autoProcessQueue: scope.autoProcess,
					success: function(file, response) {
						console.info(file);
						if (scope.callBack != null) {
							scope.callBack({
								response: response
							});
						}
					}
				});
			}
		}
	});