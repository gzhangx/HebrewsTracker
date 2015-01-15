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

        $scope.statsByUserId = function() {
            var allStats = {};
            var statsAry = [];
            var svers = $scope.verses;
            var totalVersToDate = $scope.scheduleStartSel.DaysPassed;
            var i = 0;
            var stat = null;
            var readersByDate = {};
            for (i = 0; i < svers.length; i++) {
                var v = svers[i];
                var vpos = $scope.VersesInSchedule[v.title] || null;
                if (vpos === null){
                    $scope.recordedHash[v.title] = {valid: false, cls:'', tip:null};
                    continue;
                }
                v.vpos = vpos;
                var diffDays = VersesDirect.dateDiffInDays728($scope.scheduleStartDate, new Date(v.dateRead));
                var dayOnly = VersesDirect.getDateInt(v.dateRead);
                var rbd = readersByDate[dayOnly] || {date: VersesDirect.getDateOnly(v.dateRead), vcount : 0, pcount: 0, uids:{}};
                rbd.vcount++;
                if ((rbd.uids[v.user._id] || null) === null) {
                    rbd.uids[v.user._id] = 1;
                    rbd.pcount++;
                } else
                    rbd.uids[v.user._id] = rbd.uids[v.user._id] + 1;
                readersByDate[dayOnly] = rbd;
                v.vpos.readPos = diffDays;
                v.vpos.diff = diffDays - vpos.pos;
                stat = allStats[v.user._id] || null;
                if (stat === null) {
                    stat = { user: v.user._id, displayName: v.user.displayName || null, email: v.user.email, read: 1, totalToDate: totalVersToDate, lates : 0, latesByDay : {}};
                    if (stat.displayName === null || stat.displayName.trim()==='') {
                        stat.displayName = stat.email || '*********';
                    }
                    allStats[v.user._id] = stat;
                    statsAry.push(stat);
                }else {
                    stat.read++;
                }
                var dayDsp = VersesDirect.AddDaysToYmd(new Date(v.dateRead), 0);
                if (v.vpos.diff > 0) {
                    stat.latesByDay[v.vpos.diff] = (stat.latesByDay[v.vpos.diff] || 0) + 1;
                    stat.lates++;
                    $scope.recordedHash[v.title] = {valid: true, late: v.vpos.diff, cls : 'late', tip: 'late for ' + v.vpos.diff+' days', dateRead: dayDsp};
                } else
                    $scope.recordedHash[v.title] = {valid: true, late: 0, cls : 'green', tip: 'Completed on ' + v.dateRead, dateRead: dayDsp};
            }

            statsAry.sort(function(a,b){return b.read - a.read;});
            for(i = 0; i < statsAry.length;i++) {
                stat = statsAry[i];
                if (stat.totalToDate !== 0)
                    stat.completePct = Math.round(stat.read*100/stat.totalToDate);
            }
            $scope.allStats = statsAry;
            var readersByDateAry = [];
            for (var rday in readersByDate) readersByDateAry.push(readersByDate[rday]);
            readersByDateAry.sort(function(a,b){ return a.date > b.date;});
            datashare.readersByDate = readersByDateAry;
        };

        $scope.emailChanged = function() {
            $scope.resetAll();
            //if ($scope.hasAuth === false) return;
            var eml = $scope.email || null;
            if (eml === null || eml.trim() === '') {
                eml = '*';
            }

            var qry = VersesDirect.qryDct;
            if (eml === '*') qry = VersesDirect.qryAll;
            $scope.verses = qry.query({email:eml}, function(data) {
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

        VersesDirect.scheduleDctf(function(res){
            $scope.fullSchedule = res.fullSchedule;
            $scope.scheduleStartDate = res.scheduleStartDate;

            var scheduleStarts = res.scheduleStarts;
            $scope.scheduleStarts = scheduleStarts;
            if (scheduleStarts.length > 0) {
                $scope.scheduleStartSel = scheduleStarts[0];
            }

            $scope.scheduleChanged();
        });

    }
]);