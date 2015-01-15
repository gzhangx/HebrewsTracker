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
    Range: {
        type: String,
        default: '',
        trim: true,
        required: 'Range cannot be blank'
    },
    PeriodStart :{
        type: Number
    },
    PeriodEnd :{
        type: Number
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