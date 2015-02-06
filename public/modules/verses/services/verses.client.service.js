'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('verses').factory('Verses', ['$resource',
	function($resource) {
		return $resource('verses/:verseId', {
			verseId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('verses').factory('VersesDirect', ['$resource','$http',
    function($resource, $http) {
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
        function getDay(a, days) {
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var dt = new Date(utc1+ (days*_MS_PER_DAY) + _MS_PER_HALFDAY);
            return yyyyMMdd(dt);
        }

        function getDateInt(d) {
            if (typeof d === 'string') d= new Date(d);
            return (d.getFullYear()*100)+(d.getMonth()*10)+ d.getDate();
        }

        var res = {
            fullSchedule : null,
            scheduleStartDate : null,
            scheduleStarts : [],
            selectedSchedule: null,
            verses : [],
            curSchedule : [],
            VersesInSchedule: {},
            recordedHash : {},
            allStats : {},
            readersByDate : [],
            signReqs : [],
            rcdDct : $resource('versesDirect/', {}, {}),
            qryDct: $resource('versesQry/:email', {email:'@email'}, {}),
            qryAll: $resource('versesQryAll', {}, {}),
            scheduleDct: $resource('schedule.json', {}, {}),
            uReqSign : $resource('/sign/requestSign', {}, {}),
            lSignReqFunc : function(data){ return $http.post('/sign/signRequest', data);},
            signListFunc : function(dta){return $http.post('/sign/list', dta);},
            AddDaysToYmd: getDay,
            dateDiffInDays728: dateDiffInDays728,
            getDateOnly : function(d) {
                if (typeof d === 'string') d= new Date(d);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate());
            }
        };

        res.createScheduleStarts = function(curDate) {
            var startDate = res.scheduleStartDate;
            var daysMax = dateDiffInDays(startDate, curDate);
            var maxStart = Math.floor(daysMax/7/13)*13;
            var days = daysMax%728;
            var start = Math.floor(days/7/13)*13;

            var scheduleStarts = [];
            for (var i = 0; i >=-1 ;i--) {
                var desc = getDay(startDate, (maxStart*7)+ (i*7*13) ) + ' - ' + getDay(startDate, (maxStart*7)+ ((i+1)*7*13) );
                scheduleStarts.push({
                    Desc : desc,
                    ScheduleStartDay : (start*7)+ (i*7*13),
                    DaysPassed: days - (start*7) + 1
                });
            }
            res.scheduleStarts = scheduleStarts;

            if (scheduleStarts.length > 0) {
                res.selectedSchedule = scheduleStarts[0];
                //res.setCurSchedule(res.selectedSchedule.ScheduleStartDay);
            }
        };

        res.setEmail = function(email, done) {
            res.getUserVerses(email, function(res){
                res.setSchedule(res.selectedSchedule, done);
            });
        };
        res.setSchedule = function(schedule, done) {
            function doDone(xx){
                res.signReqs = xx;
                if (done) done(res);
            }
            if (schedule !== null) {
                res.selectedSchedule = schedule;
                res.setCurSchedule(res.selectedSchedule.ScheduleStartDay);
                res.statsByUserId(res.selectedSchedule.DaysPassed);
                res.signListFunc({ScheduleStartDay: schedule.ScheduleStartDay}).success(doDone).error(function(err){
                    console.log(err);
                });
                return;
            }

            doDone();
        };

        res.scheduleDctf = function(email, done){
            if (res.fullSchedule === null) {
                $resource('schedule.json', {}, {}).get(function(sch){
                    var startDate = new Date(sch.startDate.y, sch.startDate.m, sch.startDate.d);
                    res.fullSchedule = sch;
                    res.scheduleStartDate = startDate;
                    res.createScheduleStarts(new Date());
                    res.setEmail(email, done);
                });
            } else {
                res.createScheduleStarts(new Date());
                res.setEmail(email, done);
            }
        };

        res.getUserVerses = function(email, done) {
            var eml = email || null;
            if (eml === null || eml.trim() === '') {
                eml = '*';
            }
            var qry = res.qryDct;
            if (eml === '*') qry = res.qryAll;
            qry.query({email:eml}, function(data) {
                res.verses = data;
                if (done) done(res);
            });
        };

        //set recordedHash (of reads and lates), allStats (for all users), and
        res.statsByUserId = function(totalVersToDate) {
            var allStats = {};
            var statsAry = [];
            var svers = res.verses;
            var i = 0;
            var stat = null;
            var readersByDate = {};
            var recordedHash = {};
            for (i = 0; i < svers.length; i++) {
                var v = svers[i];
                var vpos = res.VersesInSchedule[v.title] || null;
                if (vpos === null){
                    recordedHash[v.title] = {valid: false, cls:'', tip:null};
                    continue;
                }
                v.vpos = vpos;
                var diffDays = dateDiffInDays728(res.scheduleStartDate, new Date(v.dateRead));
                var dayOnly = getDateInt(v.dateRead);
                var rbd = readersByDate[dayOnly] || {date: res.getDateOnly(v.dateRead), vcount : 0, pcount: 0, uids:{}};
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
                    stat = { user: v.user._id, displayName: v.user.displayName || null, email: v.user.email, read: 1, totalToDate: totalVersToDate, lates : 0, latesByDay : {}, dups:{}};
                    stat.dups[v.title] = 1;
                    if (stat.displayName === null || stat.displayName.trim()==='') {
                        stat.displayName = stat.email || '*********';
                    }
                    allStats[v.user._id] = stat;
                    statsAry.push(stat);
                }else if (!stat.dups[v.title]){
                    stat.dups[v.title] = 1;
                    stat.read++;
                }
                var dayDsp = res.AddDaysToYmd(new Date(v.dateRead), 0);
                if (v.vpos.diff > 0) {
                    stat.latesByDay[v.vpos.diff] = (stat.latesByDay[v.vpos.diff] || 0) + 1;
                    stat.lates++;
                    recordedHash[v.title] = {valid: true, late: v.vpos.diff, cls : 'late', tip: 'late for ' + v.vpos.diff+' days', dateRead: dayDsp};
                } else
                    recordedHash[v.title] = {valid: true, late: 0, cls : 'green', tip: 'Completed on ' + v.dateRead, dateRead: dayDsp};
            }

            res.recordedHash = recordedHash;
            statsAry.sort(function(a,b){return b.read - a.read;});
            for(i = 0; i < statsAry.length;i++) {
                stat = statsAry[i];
                if (stat.totalToDate !== 0)
                    stat.completePct = Math.round(stat.read*100/stat.totalToDate);
            }
            res.allStats = statsAry;
            var readersByDateAry = [];
            for (var rday in readersByDate) readersByDateAry.push(readersByDate[rday]);
            readersByDateAry.sort(function(a,b){ return a.date > b.date;});
            res.readersByDate = readersByDateAry;
        };

        res.setCurSchedule = function(scheduleStartDay) {
            var start = Math.floor(scheduleStartDay/7/13)*13;
            var VersesInSchedule = {};
            var curSchedule = [];
            var sch = res.fullSchedule.schedule;
            for (var i = 0; i < 13; i++) {
                var schLine = sch[start + i];
                for (var j = 1; j < schLine.length; j++){
                    var title = schLine[j];
                    VersesInSchedule[title] = res.fullSchedule.verses[title];
                }
                curSchedule.push(schLine);
            }
            res.curSchedule = curSchedule;
            res.VersesInSchedule = VersesInSchedule;
        };
        return res;
    }
]);