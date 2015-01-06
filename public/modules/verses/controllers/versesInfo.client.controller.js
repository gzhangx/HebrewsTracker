'use strict';

angular.module('verses').controller('VersesInfoController', ['$scope', '$stateParams', '$location', 'Authentication', 'VersesDirect',
	function($scope, $stateParams, $location, Authentication, VersesDirect) {

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
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;
        var _MS_PER_HALFDAY = _MS_PER_DAY/2;

        // a and b are javascript Date objects
        function dateDiffInDays(a, b) {
            // Discard the time and time-zone information.
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

            return Math.floor((utc2 + _MS_PER_HALFDAY - utc1) / _MS_PER_DAY);
        }

        function dateDiffInDays728(a, b) {
            // Discard the time and time-zone information.
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

            return ((utc2 - utc1) / _MS_PER_DAY) %728;
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
            $scope.VersesInSchedule = {};
            if ( ($scope.scheduleStartSel || null) === null) return;
            if ( ($scope.scheduleStartSel.Days || null) === null) return;
            var start = Math.floor($scope.scheduleStartSel.Days/7/13)*13;
            var curSchedule = [];
            var sch = $scope.fullSchedule.schedule;
            for (var i = 0; i < 13; i++) {
                var schLine = sch[start + i];
                for (var j = 1; j < schLine.length; j++){
                    var title = schLine[j];
                    $scope.VersesInSchedule[title] = $scope.fullSchedule.verses[title];
                }
                curSchedule.push(schLine);
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
                var desc = $scope.GetDay(startDate, (maxStart*7)+ (i*7*13) ) + ' - ' + $scope.GetDay(startDate, (maxStart*7)+ ((i+1)*7*13) );
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
            var i = 0;
            var stat = null;
            for (i = 0; i < svers.length; i++) {
                var v = svers[i];
                var vpos = $scope.VersesInSchedule[v.title] || null;
                if (vpos === null){
                    $scope.recordedHash[v.title] = {valid: false, cls:'', tip:null};
                    continue;
                }
                v.vpos = vpos;
                var diffDays = dateDiffInDays728($scope.scheduleStartDate, new Date(v.dateRead));
                v.vpos.readPos = diffDays;
                v.vpos.diff = diffDays - vpos.pos;
                stat = allStats[v.user._id] || null;
                if (stat === null) {
                    stat = { user: v.user._id, displayName: v.user.displayName || null, email: v.user.email, read: 1, totalToDate: totalVersToDate, lates : 0, latesByDay : {}};
                    if (stat.displayName === null || stat.displayName.trim()==='') {
                        stat.displayName = stat.email;
                    }
                    allStats[v.user._id] = stat;
                    statsAry.push(stat);
                }else {
                    stat.read++;
                }
                if (v.vpos.diff > 0) {
                    stat.latesByDay[v.vpos.diff] = (stat.latesByDay[v.vpos.diff] || 0) + 1;
                    stat.lates++;
                    $scope.recordedHash[v.title] = {valid: true, late: v.vpos.diff, cls : 'late', tip: 'late for ' + v.vpos.diff+' days'};
                } else
                    $scope.recordedHash[v.title] = {valid: true, late: 0, cls : 'green', tip: 'Completed on ' + v.created};
            }

            statsAry.sort(function(a,b){return b.read - a.read;});
            for(i = 0; i < statsAry.length;i++) {
                stat = statsAry[i];
                if (stat.totalToDate !== 0)
                    stat.completePct = Math.round(stat.read*100/stat.totalToDate);
            }
            $scope.allStats = statsAry;
        };

        $scope.emailChanged = function() {
            $scope.resetAll();
            if ($scope.hasAuth === false) return;
            var eml = $scope.email || null;
            if (eml === null || eml.trim() === '') {
                eml = '*';
            }
            $scope.verses = VersesDirect.qryDct.query({email:eml}, function(data) {
                var recordedHash = {};
                var sverses = $scope.verses;
                for (var i in sverses) {
                    var tt = sverses[i];
                    recordedHash[tt.title] = {};
                }
                $scope.recordedHash = recordedHash;
                $scope.statsByUserId();
            });
            return true;
        };

	}
]);