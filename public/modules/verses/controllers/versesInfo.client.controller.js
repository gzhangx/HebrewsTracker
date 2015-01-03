'use strict';

angular.module('verses').controller('VersesInfoController', ['$scope', '$stateParams', '$location', 'Authentication', 'VersesDirect',
	function($scope, $stateParams, $location, Authentication, VersesDirect) {

        $scope.recordedHash = {};
        $scope.curSchedule = [];
        $scope.scheduleStarts = [];
        $scope.scheduleStartDate = null;
        $scope.scheduleStartSel ={};
        $scope.allStats = [];
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;
        var _MS_PER_HALFDAY = _MS_PER_DAY/2;

        // a and b are javascript Date objects
        function dateDiffInDays(a, b) {
            // Discard the time and time-zone information.
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

            return Math.floor((utc2 + _MS_PER_HALFDAY - utc1) / _MS_PER_DAY);
        }

        function yyyyMMdd(dt) {
            var yyyy = dt.getFullYear().toString();
            var mm = (dt.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = dt.getDate().toString();
            return yyyy + '/'+(mm[1]?mm:'0'+mm[0]) + '/'+(dd[1]?dd:'0'+dd[0]); // padding
        }
        $scope.GetDay = function GetDay(a, days) {
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var dt = new Date(utc1+ (days*_MS_PER_DAY) + _MS_PER_HALFDAY);
            return yyyyMMdd(dt);
        };

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
            $scope.emailChanged();
        };

        $scope.schedule = VersesDirect.scheduleDct.get(function(sch){
            var startDate = new Date(sch.startDate.y, sch.startDate.m, sch.startDate.d);
            $scope.fullSchedule = sch;
            $scope.scheduleStartDate = startDate;
            var daysMax = dateDiffInDays(startDate, new Date());
            var maxStart = Math.floor(daysMax/7/13)*13;
            var days = daysMax%728;
            $scope.daysModed = days;
            var start = Math.floor(days/7/13)*13;

            var scheduleStarts = [];
            for (var i = 0; i >=-1 ;i--) {
                var desc = $scope.GetDay(startDate, (maxStart*7)+ (i*7*13) );
                scheduleStarts.push({
                    Desc : desc,
                    Days : (start*7)+ (i*7*13),
                    DaysPassed: days - (start*7) + 1
                });
            }
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }

            $scope.scheduleChanged();
        });

        $scope.statsByUserId = function() {
            var allStats = {};
            var statsAry = [];
            var svers = $scope.verses;
            var totalVersToDate = $scope.scheduleStartSel.DaysPassed;
            for (var i = 0; i < svers.length; i++) {
                var v = svers[i];
                var stat = allStats[v.user._id] || null;
                if (stat === null) {
                    var ustat = { user: v.user._id, displayName: v.user.displayName || null, email: v.user.email, read: 1, totalToDate: totalVersToDate};
                    if (ustat.displayName === null || ustat.displayName.trim()==='') {
                        ustat.displayName = ustat.email;
                    }
                    allStats[v.user._id] = ustat;
                    statsAry.push(ustat);
                }else {
                    stat.read++;
                }
            }
            $scope.allStats = statsAry;
        };

        $scope.emailChanged = function() {
            $scope.allStats = [];
            var eml = $scope.email || null;
            if (eml === null || eml.trim() === '') {
                eml = '*';
            }
            $scope.recordedHash = {};
            $scope.verses = VersesDirect.qryDct.query({email:eml}, function(data) {
                var recordedHash = {};
                var sverses = $scope.verses;
                for (var i in sverses) {
                    var tt = sverses[i];
                    recordedHash[tt.title] = true;
                }
                $scope.recordedHash = recordedHash;
                $scope.statsByUserId();
            });
            return true;
        };

	}
]);