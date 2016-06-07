'use strict';

angular.module('verses').controller('VersesInfoController', ['$scope', '$stateParams', '$location', 'Authentication', 'VersesDirect','datashare',
	function($scope, $stateParams, $location, Authentication, VersesDirect, datashare) {

        $scope.scheduleYear = new Date().getFullYear();
        if ($scope.scheduleYear %2) {
            $scope.scheduleYear = '' + $scope.scheduleYear + ' - ' + ($scope.scheduleYear+1);
        } else {
            $scope.scheduleYear = '' + ($scope.scheduleYear - 1) + ' - ' + $scope.scheduleYear;
        }
        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartDate = null;
        $scope.scheduleStartSel ={};
        $scope.selectedUserId = null;
        $scope.allStats = [];
        if (Authentication.user !== null && Authentication.user !== '') {
            $scope.hasAuth = true;
            $scope.email = Authentication.user.email;
        } else {
            $scope.hasAuth = false;
        }

        $scope.resetAll = function() {
            $scope.allStats = [];
            $scope.recordedHash = {};
        };

        function setScope(){
            $scope.curSchedule = VersesDirect.curSchedule;
            $scope.CurWeekMap = VersesDirect.CurWeekMap;
            $scope.CurWeekAry = VersesDirect.CurWeekAry;
            $scope.CurDay = VersesDirect.CurDay;
            $scope.allStats = VersesDirect.allStats;
            $scope.recordedHash = VersesDirect.recordedHash;
            datashare.readersByDate = VersesDirect.readersByDate;
            $scope.selectedUserId = VersesDirect.selectedUserId;
        }
        $scope.emailChanged = function() {
            $scope.resetAll();
            //if ($scope.hasAuth === false) return;
            VersesDirect.setEmail($scope.email, function(){
                setScope();
            });
            return true;
        };

        $scope.SetCurUserId = function(uid) {
            $scope.selectedUserId = uid;
        };

        $scope.scheduleChanged = function() {
            $scope.VersesInSchedule = {};
            if ( ($scope.scheduleStartSel || null) === null) return;
            //if ( ($scope.scheduleStartSel.ScheduleStartDay || null) === null) return;
            VersesDirect.setSchedule($scope.scheduleStartSel, setScope);
        };

        VersesDirect.scheduleDctf($scope.email, function(err, res){
            var scheduleStarts = res.scheduleStarts;
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }

            setScope();
        });

    }
]);