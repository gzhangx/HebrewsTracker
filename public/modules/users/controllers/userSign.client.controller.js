'use strict';

angular.module('users').controller('UserSignController', ['$scope', 'Authentication','VersesDirect',
	function($scope, Authentication, VersesDirect) {
		$scope.authentication = Authentication;

        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartSel ={};
        $scope.allStats = [];

        VersesDirect.scheduleDctf($scope.authentication.user.email, function(){
            $scope.curSchedule = VersesDirect.curSchedule;
            $scope.allStats = VersesDirect.allStats;
            $scope.recordedHash = VersesDirect.recordedHash;
            var scheduleStarts = VersesDirect.scheduleStarts;
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }
        });

        $scope.scheduleChanged = function() {};
        $scope.RequestSign = function(){

        };

	}
]);