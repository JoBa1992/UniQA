'use strict';

angular.module('UniQA')
	.directive('dropZone', function($rootScope) {
		return {
			scope: {
				action: '@',
				autoprocessdz: '=?',
				dzType: '=?',
				callBack: '&?',
				dataMax: '=?',
				mimetypes: '=?',
				message: '@?',
				noFileDisplay: '=?',
				url: '=?'
			},
			link: function(scope, element /*, attrs*/ ) {
				// console.info(scope.url);
				var iconType = '';
				var Dropzone = Dropzone;
				// console.log('Creating dropzone');
				// Autoprocess the form
				if (scope.autoprocessdz === 'true') {
					scope.autoProcess = true;
				} else {
					scope.autoProcess = false;
				}

				if (!scope.action) {
					scope.action = '/';
				}

				// Max file size
				if (scope.dataMax === null) {
					scope.dataMax = Dropzone.prototype.defaultOptions.maxFilesize;
				} else {
					scope.dataMax = parseInt(scope.dataMax);
				}

				// Message for the uploading
				if (scope.message === null) {
					scope.message = Dropzone.prototype.defaultOptions.dictDefaultMessage;
				}

				//sort out which icon should be used in template
				if (scope.dzType === 'csvImport') {
					iconType = 'fa-file-text-o';
				}

				// need to add here different types of icons for each possible type,
				// and change how the files look
				var previewTemp = '<div class=\"dz-preview dz-file-preview\" style=\"display:none;\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\" style=\"width:100%;\"></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"></div>\n  <div class=\"dz-error-mark\"></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>';

				if (scope.noFileDisplay === 'true') {

				} else {
					previewTemp = '<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\" style=\"width:100%;\"><span style=\"width:100%;\" data-dz-name> </span>\n<i style=\"color:#bbb;margin-top:.3em;width:100%;\" class=\"fa " + iconType + " fa-3x\"></i></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>';
				}

				$rootScope.dropzone = element.dropzone({
					url: scope.url,
					maxFilesize: scope.dataMax,
					maxFiles: 10,
					paramName: 'file',
					uploadMultiple: true,
					parallelUploads: 10,
					acceptedFiles: scope.mimetypes,
					maxThumbnailFilesize: scope.dataMax,
					dictDefaultMessage: scope.message,
					autoProcessQueue: scope.autoProcess,
					previewTemplate: previewTemp,
					success: function(file, response) {
						if (scope.callBack !== null) {
							scope.callBack({
								response: response
							});
						}
					}
				});
			}
		};
	});