'use strict';

angular.module('users').controller('UserInfoController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;


        $scope.userInfo = {};
        $scope.resetActive = false;
        $scope.roles = [{name: 'user', checked : true},{name: 'lead', checked : false},{name: 'admin', checked : false}];
        $scope.UsrInfo = function() {
            $scope.success = $scope.error = null;
            var userInfo = this.userInfo;
            if (userInfo._id) {
                userInfo.roles = this.roles.filter(function(itm){return itm.checked === true}).map(function(itm){return itm.name;});
            }
            $http.post('/userSetActive', $scope.userInfo).success(function(response) {
                $scope.message = 'found ' + response.email + ' ' + response.message;
                $scope.userInfo = response;
                if (response && response._id && response.roles) {
                    $scope.roles.every(function(rr){
                        rr.checked = response.roles.indexOf(rr.name) >= 0;
                        return true;
                    });

                }
            }).error(function(response) {
                    $scope.error = response.message;
            });
        };


	}
]);