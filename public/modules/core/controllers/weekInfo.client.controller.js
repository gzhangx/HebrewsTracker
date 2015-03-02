'use strict';

angular.module('core').controller('WeekInfoController', ['$scope', '$stateParams', '$location', 'Authentication', 'VersesDirect','datashare',
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
        $scope.allStats = [];

            $scope.email = '*';
        $scope.hasAuth = false;

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
            $scope.WeekMap = {};
            for(var whichWeek = 0; whichWeek <$scope.CurWeekAry.length; whichWeek++) {
                var week = $scope.CurWeekAry[whichWeek];
                var weekDay = '';
                switch(whichWeek) {
                    case 0: weekDay = '一'; break;
                    case 1:weekDay = '二'; break;
                    case 2:weekDay = '三'; break;
                    case 3:weekDay = '四'; break;
                    case 4:weekDay = '五'; break;
                    case 5:weekDay = '六'; break;
                    case 6:weekDay = '日'; break;
                }
                $scope.WeekMap[week] = {Week: whichWeek, MonthDay : $scope.CurWeekMap[week].substring(5)+'('+ weekDay+ ')' };
            }
        }


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