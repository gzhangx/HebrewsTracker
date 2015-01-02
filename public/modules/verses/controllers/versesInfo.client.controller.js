'use strict';

angular.module('verses').controller('VersesInfoController', ['$scope', '$stateParams', '$location', 'Authentication', 'VersesDirect',
	function($scope, $stateParams, $location, Authentication, VersesDirect) {
        $scope.schedule = VersesDirect.scheduleDct.get();
        $scope.verses = VersesDirect.rcdDct.get({email:'gzhangx@hotmail.com'});
	}
]);