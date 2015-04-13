'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Verse = mongoose.model('Verse'),
    User = mongoose.model('User'),
	_ = require('lodash');
var async = require('async');

var UserCtrl = require('./users.server.controller');

var ObjectId = mongoose.Types.ObjectId;

/**
 * Create a verse
 */
exports.create = function(req, res) {
    var titles = req.body.titles || null;
    if (titles === null) {
        titles = [];
        titles.push(req.body.title);
    }

    async.waterfall(titles.map(function(title){
        return function(allResult, callback){
            if (!callback){
                callback = allResult;
                allResult = [];
            }
        var verse = new Verse(req.body);
        verse.dateRead = verse.created = new Date();
        verse.ip = req.ip;

        //var title = verse.title || null;
        if (title === null || title.trim() === '') {
            return callback({ status : 400,
                message: 'empty title'
            }, allResult);
        }
        verse.title = title;
        var saveFunc = function() {
            verse.save(function(err) {
                if (err) {
                    return callback({
                        status :400,
                        message: errorHandler.getErrorMessage(err)
                    }, allResult);
                } else {
                    //res.json(verse);
                    allResult.push(verse);
                    callback(null, allResult);
                }
            });
        };
        var saveAndCheckDup = function() {
            var today = new Date();
            var utcMill = today.valueOf();
            var utc6Days= 12*24*3600*1000; //changed to 12 days
            Verse.findOne({title: title, user: new ObjectId(verse.user.id), created: {'$gte': new Date(utcMill - utc6Days)}}).exec(function(err, posts){
                posts = posts || null;
                if (posts === null) {
                    saveFunc();
                }else {
                    //return res.status(400).send({
                    return callback({status: 400,
                        message: 'You already submitted this verse'});
                    //});
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
                //return res.status(400).send({ message: 'err Invalid email'});
                return callback({status: 400, message:'err Invalid email'}, allResult);
            }
            User.findOne({email: email}, function(err, user) {
                err = err || null;
                if (err !== null) {
                    console.log(err);
                    //return res.status(400).send({ message: 'err ' + err});
                    return callback({status: 400, message: 'err ' + err}, allResult);
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
                            return callback({status:400,  message: 'err ' + err});
                        }
                    });

                }

            });
        }
        };
    }), function(err, result){
        console.log('done, err=' + err+' res=' + result);
        if (err || null !== null) {
            return res.status(err.status).send({ message: err.message});
        }
        if ( (result || null) === null) {
            return res.status(400).send({message: 'null result'});
        }

        console.log('reslen=' + result.length);
        if (result.length === 1) {
            return res.json(result[0]);
        }
        return res.json(result);

    });


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

    delete verse.created;
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

exports.listAnnAll = function(req, res) {
    req.body.all = true;
    exports.list(req,res);
};
/**
 * List of verses
 */
exports.list = function(req, res) {

    //if ((req.user || null) === null) return res.status(400).send({
    //    message: 'Not authed'
    //});


    var utcMill = new Date().valueOf();
    var daysLookback = (13*7 * 2 + 10);
    var utcPastDays= 24*3600*1000 * daysLookback;
    var earliestDay = new Date(utcMill - utcPastDays);

    var qry = { created:{$gt:earliestDay}};
    var email = null;
    var showAll = false;
    if ((req.body || null) !== null) {
        email = req.body.email || null;
        showAll = req.body.all === true;
    }
    if (email === null || email === '') {
        email = req.params.email || null;
    }

    var isAdmin = false;
    var curId = null;
    if ((req.user || null) !== null) {
        isAdmin = req.user.IsAdmin();
        curId = req.user.id;
        if (!isAdmin) {
            if (email === null || email === '*' ) {
                //console.log('user ' + req.user.email+' not admin, set email');
                email = req.user.email;
            }
        }
    }

    if (showAll) email = '*';

    var qryAct = function(){
        Verse.find(qry,{ip:0}).sort('-created').populate('user', 'displayName email').exec(function(err, verses) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {

                if (isAdmin) {
                    res.json(verses);
                }else {
                    var cverses = [];
                    for (var i = 0; i < verses.length; i++){
                        var v =verses[i];
                        if (v.user === null) continue;
                        if (v.user.id !== curId){
                            cverses.push({title: v.title, group: v.group,user :{_id: v.user.id}, dateRead: v.dateRead});
                        }else cverses.push(v);
                    }
                    res.json(cverses);
                }
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