'use strict';

angular.module('users').controller('UserSignController', ['$scope', 'Authentication','VersesDirect',
	function($scope, Authentication, VersesDirect) {
		$scope.authentication = Authentication;

        $scope.email = null;
        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartSel ={};
        $scope.allStats = [];

        function setScope(err) {
            $scope.curSchedule = VersesDirect.curSchedule;
            $scope.allStats = VersesDirect.allStats;
            $scope.recordedHash = VersesDirect.recordedHash;
            $scope.scheduleStarts = VersesDirect.scheduleStarts;
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
            VersesDirect.setSchedule($scope.scheduleStartSel, setScope);
        };
        $scope.RequestSign = function(){
            var sign = new VersesDirect.uReqSign($scope.scheduleStartSel);
            sign.email = this.email;
            sign.$save(function(response) {
                $scope.message = response.message;
            }, function(errorResponse) {
                $scope.error = errorResponse.message;
            });
        };

	}
]);