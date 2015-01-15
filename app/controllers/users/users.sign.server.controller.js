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
    var user = req.user;
    var message = null;

    var doEmail = function(sreq) {
      console.log('TODO: sending sign req email');
    };
    if (user) {
        SignRequest.findOne({range: req.body.range, user:{_id: req.user.id}}, function(err, signReq){
           if ( (err || null) !== null)  {
               console.log('error fing sign ' + err);
               return res.status(400).send({
                   message: errorHandler.getErrorMessage(err)
               });
           } else {
               if ( (signReq || null) === null) {
                   signReq = new SignRequest(req.body);
                   signReq.created = new Date();
                   signReq.ip = req.ip;
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
                   doEmail(signReq);
               }
           }
        });

    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};
