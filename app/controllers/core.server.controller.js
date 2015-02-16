'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};

exports.blankView = function(req, res) {
    res.render('blankView', {
        user: req.user || null,
        request: req
    });
};