'use strict';


angular.module('core').controller('HomeController', ['$scope', 'datashare',
	function($scope, datashare) {
        $scope.dailyReads = datashare;
	}
]);