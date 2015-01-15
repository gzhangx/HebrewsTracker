'use strict';

angular.module('users').controller('UserInfoController', ['$scope', 'Authentication','VersesDirect',
	function($scope, Authentication, VersesDirect) {
		$scope.authentication = Authentication;


        $scope.RequestSign = function(){
            //VersesDirect.
        }

	}
]);