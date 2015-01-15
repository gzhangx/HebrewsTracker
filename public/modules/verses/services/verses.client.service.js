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

angular.module('verses').factory('VersesDirect', ['$resource',
    function($resource) {
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

        function createScheduleStarts(curDate) {
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
                    Days : (start*7)+ (i*7*13),
                    DaysPassed: days - (start*7) + 1
                });
            }
            res.scheduleStarts = scheduleStarts;
        }

        var res = {
            fullSchedule : null,
            scheduleStartDate : null,
            scheduleStarts : [],
            rcdDct : $resource('versesDirect/', {}, {}),
            qryDct: $resource('versesQry/:email', {email:'@email'}, {}),
            qryAll: $resource('versesQryAll', {}, {}),
            scheduleDct: $resource('schedule.json', {}, {}),
            AddDaysToYmd: getDay,
            dateDiffInDays728: dateDiffInDays728,
            createScheduleStarts: createScheduleStarts
        };

        res.scheduleDctf = function(done){
            if (res.fullSchedule === null) {
                $resource('schedule.json', {}, {}).get(function(sch){
                    var startDate = new Date(sch.startDate.y, sch.startDate.m, sch.startDate.d);
                    res.fullSchedule = sch;
                    res.scheduleStartDate = startDate;
                    createScheduleStarts(new Date());
                    done(res);
                });
            } else {
                createScheduleStarts(new Date());
                done(res);
            }
        };
        return res;
    }
]);