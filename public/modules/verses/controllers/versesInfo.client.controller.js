'use strict';

angular.module('verses').controller('VersesInfoController', ['$scope', '$stateParams', '$location', 'Authentication', 'VersesDirect',
	function($scope, $stateParams, $location, Authentication, VersesDirect) {

        $scope.email = '*';
        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartDate = null;
        $scope.scheduleStartSel ={};
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;
        var _MS_PER_HALFDAY = _MS_PER_DAY/2;

        // a and b are javascript Date objects
        function dateDiffInDays(a, b) {
            // Discard the time and time-zone information.
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

            return Math.floor((utc2 + _MS_PER_HALFDAY - utc1) / _MS_PER_DAY);
        };

        function yyyyMMdd(dt) {
            var yyyy = dt.getFullYear().toString();
            var mm = (dt.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = dt.getDate().toString();
            return yyyy + '/'+(mm[1]?mm:"0"+mm[0]) + '/'+(dd[1]?dd:"0"+dd[0]); // padding
        };
        function GetDay(a, days) {
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var dt = new Date(utc1+ (days*_MS_PER_DAY) + _MS_PER_HALFDAY);
            return yyyyMMdd(dt);
        }

        $scope.scheduleChanged = function() {
            if ( ($scope.scheduleStartSel || null) === null) return;
            if ( ($scope.scheduleStartSel.Days || null) === null) return;
            var start = Math.floor($scope.scheduleStartSel.Days/7/13)*13;
            var curSchedule = [];
            var sch = $scope.fullSchedule.schedule;
            for (var i = 0; i < 13; i++) {
                curSchedule.push(sch[start + i]);
            }
            $scope.curSchedule = curSchedule;
        };

        $scope.schedule = VersesDirect.scheduleDct.get(function(sch){
            var startDate = new Date(sch.startDate.y, sch.startDate.m, sch.startDate.d);
            $scope.fullSchedule = sch;
            $scope.scheduleStartDate = startDate;
            var days = dateDiffInDays(startDate, new Date())%728;
            var start = Math.floor(days/7/13)*13;

            var scheduleStarts = [];
            for (var i = 0; i >=-1 ;i--) {
                scheduleStarts.push({
                    Desc : GetDay(startDate, (start*7)+ (i*7*13) ),
                    Days : (start*7)+ (i*7*13)
                });
            }
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }

            $scope.scheduleChanged();
        });

        $scope.emailChanged = function() {
            $scope.verses = VersesDirect.qryDct.query({email:$scope.email}, function(data) {
                $scope.recordedHash = {};
                for (var i in $scope.verses) {
                    var tt = $scope.verses[i];
                    $scope.recordedHash[tt.title] = true;
                }
            });
            return true;
        };
        $scope.emailChanged();
	}
]);