'use strict';

/**
 * Module dependencies.
 */
var verses = require('../controllers/verses.server.controller');

module.exports = function(app) {
	// Verse Routes
	app.route('/verses')
		.get(verses.list)
		.post(verses.create);

    app.route('/versesQry/:email')
        .get(verses.list);
    app.route('/versesQryAll')
        .get(verses.listAnnAll);

    app.route('/versesDirect')
        .post(verses.create);

	app.route('/verses/:verseId')
		.get(verses.read)
		.put(verses.hasAuthorization, verses.update)
		.delete(verses.hasAuthorization, verses.delete);

	app.route('/blankView/*').get(verses.renderBlankview);
	// Finish by binding the verse middleware
	app.param('verseId', verses.verseByID);
};