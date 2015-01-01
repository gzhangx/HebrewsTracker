'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Verse = mongoose.model('Verse'),
    User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a article
 */
exports.create = function(req, res) {
	var verse = new Verse(req.body);
    verse.ip = req.ip;
    var saveFunc = function() {
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
    if ( (req.user || null) !== null) {
	    verse.user = req.user;
        saveFunc();
    }else {
        var email = req.body.email || null;
        if (email === null || email.trim() === '') return res.status(400).send({ message: 'email required'});
        User.findOne({email: email}, function(err, user) {
            err = err || null;
            if (err !== null) {
                console.log(err);
                return res.status(400).send({ message: 'err ' + err});
            }
            user = user || null;
            if (user !== null) {
                verse.user = user;
                saveFunc();
            } else {
                user = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: email,
                    displayName: req.body.displayName,
                    email: email,
                    provider : 'unauthed'
                });
                user.save(function(err){
                    err = err || null;
                    if (err === null) {
                    verse.user = user;
                    saveFunc();
                    }else {
                        return res.status(400).send({ message: 'err ' + err});
                    }
                });

            }

        });
    }


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