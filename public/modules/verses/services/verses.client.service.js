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
        return {
            rcdDct : $resource('versesDirect/', {}, {}),
            qryDct: $resource('versesQry/:email', {email:'@email'}, {}),
            qryAll: $resource('versesQryAll', {}, {}),
            scheduleDct: $resource('schedule.json', {}, {})
        };
    }
]);