'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	verses = require('../../app/controllers/verses.server.controller');

module.exports = function(app) {
	// Verse Routes
	app.route('/verses')
		.get(verses.list)
		.post(users.requiresLogin, verses.create);

    app.route('/versesQry/:email')
        .get(verses.list);
    app.route('/versesQryAll')
        .get(verses.listAnnAll);

    app.route('/versesDirect')
        .post(verses.create);

	app.route('/verses/:verseId')
		.get(verses.read)
		.put(users.requiresLogin, verses.hasAuthorization, verses.update)
		.delete(users.requiresLogin, verses.hasAuthorization, verses.delete);

	// Finish by binding the verse middleware
	app.param('verseId', verses.verseByID);
};