'use strict';


angular.module('core').controller('HomeController', ['$scope', 'datashare',
	function($scope, datashare) {
        $scope.dailyReads = datashare;
        $scope.debugremove = 0;
        $scope.$watch('dailyReads', function(newVal){
            $scope.debugremove ++;
        }, true);
	}
]);