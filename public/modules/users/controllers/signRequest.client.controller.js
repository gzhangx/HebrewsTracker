'use strict';

angular.module('users').controller('SignRequestController', ['$scope', 'Authentication','VersesDirect',
	function($scope, Authentication, VersesDirect) {
		$scope.authentication = Authentication;

        $scope.email = null;
        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartSel ={};
        $scope.allStats = [];
        $scope.signList = [];

        function setScope() {
            $scope.curSchedule = VersesDirect.curSchedule;
            $scope.allStats = VersesDirect.allStats;
            $scope.recordedHash = VersesDirect.recordedHash;
            $scope.scheduleStarts = VersesDirect.scheduleStarts;
            $scope.signReqs = VersesDirect.signReqs;
        }
        VersesDirect.scheduleDctf($scope.authentication.user.email, function(){
            setScope();
            var scheduleStarts = VersesDirect.scheduleStarts;
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }
        });

        $scope.scheduleChanged = function() {
            VersesDirect.setSchedule($scope.scheduleStartSel);
            setScope();
        };
        $scope.SignRequest = function(){
            var ids = $scope.signReqs.filter(function(x){return x.checked;}).map(function(x){ return x._id;});
            var sign = new VersesDirect.lSignReqFunc({ids: ids}).success(function(response) {
                $scope.message = response.message;
            }).error(function(errorResponse) {
                $scope.error = errorResponse.message;
            });
        };

	}
]);