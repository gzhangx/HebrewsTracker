'use strict';

//Menu service used for managing  menus
angular.module('verses').factory('datashare', ['$rootScope',
    function ($rootScope) {
        var datashare = {curSchedule:[]};

        datashare.setSchedule = function(data) {
            this.curSchedule = data;
            $rootScope.$broadcast('verseDataChange');
        };

        datashare.addCallback = function(scope, cb) {
          scope.$on('verseDataChang', function() {cb();});
        };


        return datashare;
    }
]);