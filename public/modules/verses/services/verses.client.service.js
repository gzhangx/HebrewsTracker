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
        function GetDay(a, days) {
            var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            var dt = new Date(utc1+ (days*_MS_PER_DAY) + _MS_PER_HALFDAY);
            return yyyyMMdd(dt);
        };
        return {
            rcdDct : $resource('versesDirect/', {}, {}),
            qryDct: $resource('versesQry/:email', {email:'@email'}, {}),
            qryAll: $resource('versesQryAll', {}, {}),
            scheduleDct: $resource('schedule.json', {}, {}),
            AddDaysToYmd: GetDay,
            dateDiffInDays728: dateDiffInDays728,
            dateDiffInDays: dateDiffInDays
        };
    }
]);