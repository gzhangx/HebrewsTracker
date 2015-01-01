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