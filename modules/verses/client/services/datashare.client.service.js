'use strict';

//Menu service used for managing  menus
angular.module('verses').factory('datashare', ['$rootScope',
    function ($rootScope) {
        return {curData:{}, readersByDate:[]};
    }
]);