'use strict';

// Setting up route
angular.module('verses').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listVerses', {
			url: '/verses',
			templateUrl: 'modules/verses/client/views/list-verses.client.view.html'
		}).
		state('createVerse', {
			url: '/verses/create',
			templateUrl: 'modules/verses/client/views/create-verse.client.view.html'
		}).
        state('createSimpleVerse', {
            url: '/recordVerse',
            templateUrl: 'modules/verses/client/views/record-verse.client.view.html'
        }).
            state('createMultiVerse', {
                url: '/recordVerses',
                templateUrl: 'modules/verses/client/views/record-verses.client.view.html'
            }).
		state('viewVerse', {
			url: '/verses/:verseId',
			templateUrl: 'modules/verses/client/views/view-verse.client.view.html'
		}).
		state('editVerse', {
			url: '/verses/:verseId/edit',
			templateUrl: 'modules/verses/client/views/edit-verse.client.view.html'
		}).
            state('week', {
                url: '/week',
                templateUrl: 'modules/verses/client/views/week.client.view.html'
            }).
	    state('VerseInfo', {
                url: '/versesInfo',
                templateUrl: 'modules/verses/client/views/versesInfo.client.view.html'
            });
	}
]);