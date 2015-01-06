'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Verse = mongoose.model('Verse'),
    User = mongoose.model('User'),
	_ = require('lodash');

var UserCtrl = require('./users.server.controller');

var ObjectId = mongoose.Types.ObjectId;

/**
 * Create a verse
 */
exports.create = function(req, res) {
	var verse = new Verse(req.body);
    verse.dateRead = verse.created = new Date();
    verse.ip = req.ip;
    var title = verse.title || null;
    if (title === null || title.trim() === '') {
        return res.status(400).send({
            message: 'empty title'
        });
    }
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
    var saveAndCheckDup = function() {
        var today = new Date();
        var utcMill = today.valueOf();
        var utc6Days= 6*24*3600*1000;
      Verse.findOne({title: title, user: new ObjectId(verse.user.id), created: {'$gte': new Date(utcMill - utc6Days)}}).exec(function(err, posts){
        posts = posts || null;
        if (posts === null) {
            saveFunc();
        }else {
            return res.status(400).send({
                message: 'You already submitted this verse'
            });
        }
      });
    };
    if ( (req.user || null) !== null) {
	    verse.user = req.user;
        saveAndCheckDup();
    }else {
        var email = req.body.email || null;
        if (email === null || email.trim() === '') return res.status(400).send({ message: 'email required'});
        email = email.toLowerCase();
        if (!UserCtrl.validateEmail(req.body.email)) {
            return res.status(400).send({ message: 'err Invalid email'});
        }
        User.findOne({email: email}, function(err, user) {
            err = err || null;
            if (err !== null) {
                console.log(err);
                return res.status(400).send({ message: 'err ' + err});
            }
            user = user || null;
            if (user !== null) {
                verse.user = user;
                saveAndCheckDup();
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
 * Show the current verse
 */
exports.read = function(req, res) {
	res.json(req.verse);
};

/**
 * Update a verse
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
 * Delete an verse
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
 * List of verses
 */
exports.list = function(req, res) {

    if ((req.user || null) === null) return res.status(400).send({
        message: 'Not authed'
    });


    var utcMill = new Date().valueOf();
    var daysLookback = (13*7 * 2 + 10);
    var utcPastDays= 24*3600*1000 * daysLookback;
    var earliestDay = new Date(utcMill - utcPastDays);

    var qry = { created:{$gt:earliestDay}};
    var email = null;
    if ((req.body || null) !== null) {
        email = req.body.email || null;
    }
    if (email === null || email === '') {
        email = req.params.email || null;
    }

    if (!req.user.IsAdmin()) {
        if (email === null || email === '*' ) {
            console.log('user ' + req.user.email+' not admin, set email');
            email = req.user.email;
        }
    }

    var qryAct = function(){
        Verse.find(qry,{ip:0}).sort('-created').populate('user', 'displayName email').exec(function(err, verses) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(verses);
            }
        });
    };

    if (email !== null && email.trim() !== '' && email !== '*') {
        email = email.toLowerCase();
        User.findOne({email: email}).exec(function(err,user){
            if (err !== null) {
                console.log(err);return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            if (user === null) {
                return res.status(400).send({
                    message: 'Cant find user'
                });
            }
            qry = {user: new ObjectId(user._id)};
            console.log('querying user ' + user._id);
            qryAct();
        });
    } else qryAct();
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
 * Verse authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.verse.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};