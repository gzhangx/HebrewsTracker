'use strict';

(function () {
    'use strict';

    angular
      .module('verses')
      .run(menuConfig);

    menuConfig.$inject = ['menuService'];

    function menuConfig(menuService) {
        menuService.addMenuItem('topbar', {
            title: 'Verses',
            state: 'verses',
            type: 'dropdown',
            roles: ['*']
        });

        // Add the dropdown list item
        menuService.addSubMenuItem('topbar', 'verses', {
            title: 'List Verses',
            state: 'listVerses'
        });

        // Add the dropdown create item
        menuService.addSubMenuItem('topbar', 'articles', {
            title: 'Create Verses',
            state: 'createVerse',
            roles: ['user']
        });
    }
}());
