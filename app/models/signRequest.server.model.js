/**
 * Created by gzhang on 1/15/15.
 */
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Verse Schema
 */
var SignRequestSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    Desc: {
        type: String,
        default: '',
        trim: true,
        required: 'Description cannot be blank'
    },
    ScheduleStartDay :{
        type: Number,
        required:'Start Period Required'
    },
    SignedBy : {
        type: Schema.ObjectId,
        ref: 'User'
    },
    SignedByName: {
        type: String
    },
    ip: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('SignRequest', SignRequestSchema);