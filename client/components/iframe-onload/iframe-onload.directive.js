angular.module('UniQA').directive('iframeOnload', [function() {
	return {
		scope: {
			callBack: '&iframeOnload'
		},
		link: function(scope, element, attrs) {
			element.on('load', function() {
				return scope.callBack();
			})
		}
	}
}]);