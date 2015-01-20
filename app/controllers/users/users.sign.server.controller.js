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

/**
 * Update user details
 */
exports.requestSign = function(req, res) {
    // Init Variables
    var user = req.user || null;
    var message = null;

    var doEmail = function(sreq) {
      console.log('TODO: sending sign req email');
        return res.jsonp({message:'Request sent'});
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
