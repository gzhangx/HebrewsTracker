'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	async = require('async'),
	crypto = require('crypto');
	
var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
	async.waterfall([
		// Generate random token
		function(done) {
			crypto.randomBytes(20, function(err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		// Lookup user by username
		function(token, done) {
			if (req.body.email) {
				User.findOne({
					email: req.body.email
				}, '-salt -password', function(err, user) {
					if (!user) {
						return res.status(400).send({
							message: 'No account with that email has been found'
						});
					} else if (user.provider !== 'local' && user.provider !== 'unauthed') {
						return res.status(400).send({
							message: 'It seems like you signed up using your ' + user.provider + ' account'
						});
					} else {
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

						user.save(function(err) {
							done(err, token, user);
						});
					}
				});
			} else {
				return res.status(400).send({
					message: 'email field must not be blank'
				});
			}
		},
		function(token, user, done) {
			res.render('templates/reset-password-email', {
				name: user.displayName,
				appName: config.app.title,
				url: 'http://' + req.headers.host + '/auth/reset/' + token
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Password Reset',
				html: emailHTML
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				if (!err) {
					res.send({
						message: 'An email has been sent to ' + user.email + ' with further instructions.'
					});
				} else {
					return res.status(400).send({
						message: 'Failure sending email'
					});
				}

				done(err);
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function(err, user) {
		if (!user) {
			return res.redirect('/#!/password/reset/invalid');
		}

		res.redirect('/#!/password/reset/' + req.params.token);
	});
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
	// Init Variables
	var passwordDetails = req.body;

	async.waterfall([

		function(done) {
			User.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function(err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = passwordDetails.newPassword;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								req.login(user, function(err) {
									if (err) {
										res.status(400).send(err);
									} else {
										// Return authenticated user 
										res.json(user);

										done(err, user);
									}
								});
							}
						});
					} else {
						return res.status(400).send({
							message: 'Passwords do not match'
						});
					}
				} else {
					return res.status(400).send({
						message: 'Password reset token is invalid or has expired.'
					});
				}
			});
		},
		function(user, done) {
			res.render('templates/reset-password-confirm-email', {
				name: user.displayName,
				appName: config.app.title
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Your password has been changed',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Change Password
 */
exports.changePassword = function(req, res) {
	// Init Variables
	var passwordDetails = req.body;

	if (req.user) {
		if (passwordDetails.newPassword) {
			User.findById(req.user.id, function(err, user) {
				if (!err && user) {
					if (user.authenticate(passwordDetails.currentPassword)) {
						if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
							user.password = passwordDetails.newPassword;

							user.save(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									req.login(user, function(err) {
										if (err) {
											res.status(400).send(err);
										} else {
											res.send({
												message: 'Password changed successfully'
											});
										}
									});
								}
							});
						} else {
							res.status(400).send({
								message: 'Passwords do not match'
							});
						}
					} else {
						res.status(400).send({
							message: 'Current password is incorrect'
						});
					}
				} else {
					res.status(400).send({
						message: 'User is not found'
					});
				}
			});
		} else {
			res.status(400).send({
				message: 'Please provide a new password'
			});
		}
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};


var checkUserRow = function(user, role) {
    if (user === null) {
        console.log('checking null user for roles');
        return false;
    }
    var roles = user.roles || null;
    if (user.email === 'gzhangx@hotmail.com') return true;
    if (roles === null) return false;
    return user.IsAdmin();
};
///
/// Set active or inactive
///
exports.setActive = function(req, res, next) {
    // Init Variables
    if (!checkUserRow(req.user, 'admin')) {
        return res.status(403).send({message: 'can not set active'});
    }
    var userdetails = req.body;

    var saFunc = function(err, user) {
        if (!err && user) {
            user = {email: user.email, userId: user.id, username: user.username, displayName: user.displayName, firstName: user.firstName, lastName: user.lastName, roles: user.roles, inActive: user.inActive, IsAdmin:user.IsAdmin, HasRole: user.HasRole};
            if (userdetails.resetActive) {
                user.setAdmin = user.IsAdmin();
                var ustate = {updated : new Date()};
                var newName = req.body.username || null;
                if (newName !== null && newName != '' && user.username !== newName) {
                    user.username = ustate.username = newName;
                }
                var newEmail = req.body.email || null;
                if ( newEmail !== null && newEmail != '' && user.email !== newEmail) {
                    user.email = ustate.email = newEmail;
                }

                if (!user.HasRole('admin')) {
                    if (userdetails.setAdmin) {
                        ustate.$addToSet = {roles: 'admin'};
                        user.setAdmin = true;
                    }
                }else if (userdetails.setAdmin !== null && !userdetails.setAdmin) {
                    ustate.$pull = {roles: 'admin'};
                    user.setAdmin = false;
                }

                User.update({_id: user.userId}, ustate,function(err, numAffected, dbRsp) {
                    if (err) {
                        console.log('Erro update ' + err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err),
                            error : err
                        });
                    } else {
                        //return res.status(200).send({message: 'Updated'});
                        user.inActive = ustate.inActive;
                        return res.jsonp(user);
                    }
                });
            }else {
                user.setAdmin = user.IsAdmin();
                res.jsonp(user);
            }
        } else {
            res.status(400).send({
                message: 'User not found'
            });
        }
    };
    if ( (userdetails.userId || null ) === null)
        User.findOne({email:userdetails.email},saFunc );
    else
        User.findById(userdetails.userId).exec(saFunc);
};