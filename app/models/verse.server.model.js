'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Verse Schema
 */
var VerseSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
    group: {
        type: String,
        default: '',
        trim: true
    },
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
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

mongoose.model('Verse', VerseSchema);