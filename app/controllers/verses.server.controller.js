'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Verse = mongoose.model('Verse'),
	_ = require('lodash');

/**
 * Create a article
 */
exports.create = function(req, res) {
	var verse = new Verse(req.body);
	verse.user = req.user;

	verse.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(verse);
		}
	});
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
	res.json(req.verse);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
	var verse = req.verse;

	verse = _.extend(verse, req.body);

	verse.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(verse);
		}
	});
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
	var verse = req.verse;

	verse.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(verse);
		}
	});
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
	Verse.find().sort('-created').populate('user', 'displayName').exec(function(err, verses) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(verses);
		}
	});
};

/**
 * Verse middleware
 */
exports.verseByID = function(req, res, next, id) {
	Verse.findById(id).populate('user', 'displayName').exec(function(err, verse) {
		if (err) return next(err);
		if (!verse) return next(new Error('Failed to load verse ' + id));
		req.verse = verse;
		next();
	});
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.verse.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};