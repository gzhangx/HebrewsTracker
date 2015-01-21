/**
 * Created by gzhang on 1/15/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    SignRequest = mongoose.model('SignRequest');

var config = require('../../../config/config'),
    nodemailer = require('nodemailer'),
    async = require('async');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Update user details
 */
exports.requestSign = function(req, res) {
    // Init Variables
    var user = req.user || null;
    var message = null;

    var doEmail = function(sreq) {
        user = sreq.user;
      console.log('TODO: sending sign req email ' + sreq.user);
        async.waterfall([
                function(done) {
                    User.findOne({roles:'admin'}, function(err, usr){
                       console.log('requestSign, team lead '+ usr+ ' ' + err);
                        if (err) return done(err);
                        if (usr) {
                            done(err, usr);
                        }
                    });
                },
                function(usr, done) {
                    res.render('templates/request-sign-email', {
                        name: user.displayName,
                        appName: config.app.title,
                        url: 'http://' + req.headers.host + '/sign/Sign/' +sreq._id
                    }, function(err, emailHTML) {
                        done(err, emailHTML, usr);
                    });
                },
                function(emailHTML, user, done) {
                    var mailOptions = {
                        to: user.email,
                        from: config.mailer.from,
                        subject: 'Request Sign',
                        html: emailHTML
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                        console.log('send req email to ' + user.email+ ' ' + err);
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
            ],function(err){
                if (err !== null) {
                    console.log('requestSign err ' + err);
                    return res.jsonp({error: 'Error Send Email', err : err});
                }
                return res.jsonp({message:'Request sent'});
            }
        );

    };



    function doRequestSign(user) {
        if (user) {
            SignRequest.findOne({ScheduleStartDay: req.body.ScheduleStartDay, user:{_id: user._id}}, function(err, signReq){
               if ( (err || null) !== null)  {
                   console.log('error find sign ' + err+ ' user='+user);
                   return res.status(400).send({
                       message: errorHandler.getErrorMessage(err)
                   });
               } else {
                   console.log('signReq found is ' + signReq);
                   if ( (signReq || null) === null) {
                       signReq = new SignRequest(req.body);
                       signReq.created = new Date();
                       signReq.ip = req.ip;
                       signReq.user = user;
                       signReq.save(function(err) {
                           if (err) {
                               return res.status(400).send({
                                   message: errorHandler.getErrorMessage(err)
                               });
                           } else {
                               doEmail(signReq);
                           }
                       });
                   }else {
                       signReq.updated = new Date();
                       signReq.save();
                       doEmail(signReq);
                   }
               }
            });

        } else {
            res.status(400).send({
                message: 'User is not signed in'
            });
        }
    }

    if (user === null) {
        var email = req.body.email || null;
        var rspmsg = {message:'Email not provided and not authed'};
        rspmsg.error = rspmsg.message;
        if (email === null) {
            console.log(rspmsg.error);
            return res.status(400).send(rspmsg);
        }
        User.findOne({email: email}, function(err, usr){
            usr = usr || null;
            if (err || (usr === null)) {
                console.log(err);
                return res.status(400).send({
                    error: 'Can\'t find user'
                });
            }
            doRequestSign(usr);
        });
    }else
        doRequestSign(user);
};
