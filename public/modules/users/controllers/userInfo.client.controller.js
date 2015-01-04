'use strict';

angular.module('users').controller('UserInfoController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;


        $scope.userInfo = {};
        $scope.resetActive = false;
        $scope.UsrInfo = function() {

            $scope.success = $scope.error = null;

            $http.post('/userSetActive', $scope.userInfo).success(function(response) {
                $scope.message = 'found ' + response.email + ' ' + response.message;
                $scope.userInfo = response;
            }).error(function(response) {
                    $scope.error = response.message;
            });
        };


	}
]);