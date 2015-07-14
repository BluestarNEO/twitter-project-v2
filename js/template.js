'use strict';

var Handlebars = require('hbsfy/runtime');

var tweetTmpl = require('../templates/tweet.handlebars');
var composeTmpl = require('../templates/compose.handlebars');
var threadTmpl = require('../templates/thread.handlebars');

module.exports = {
                    tweetTmpl: tweetTmpl,
                    composeTmpl: composeTmpl,
                    threadTmpl: threadTmpl
                };
