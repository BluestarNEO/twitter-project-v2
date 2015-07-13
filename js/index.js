'use strict'


var template = require('./template.js');
var $ = require('jquery');

var currentUser = {
    id: 1,
    img: '../images/brad.png',
    handle: '@bradwestfall',
    realName: 'Brad Westfall'
};

$(function () {

    var repliesUrl = "http://localhost:3000/replies/";
    var tweetsUrl = "http://localhost:3000/tweets/";
    var usersUrl = "http://localhost:3000/users/";

    (function() {
         $.getJSON(tweetsUrl)
            .done(function(tweets) {
                var count = 0;
                var sorted = [];
                for (var i = 0; i < tweets.length; i++) {
                    sorted.push(tweets[i].userId);
                }
                var assn = sorted[count]
                // console.log(sorted);
                // console.log('sorted 2:' + sorted[2]);
                tweets.forEach(function(tweet) {
                    
                    $.getJSON(usersUrl + assn)
                        .done(function(tweetUser) {
                            console.log(sorted[count])
                            console.log(assn)
                            // console.log(count);
                            console.log(tweetUser);
                            $('#tweets').append(renderThread(tweetUser, tweet.message, tweet.id));
                            count ++;
                        })       
               })
            })

        $.getJSON(usersUrl)
            .done(function(users) {
                users.forEach(function(user) {
                    $.getJSON(usersUrl  +  user.id + '/replies')
                        .done(function(replies){
                            replies.forEach(function(reply) {
                                var search = '#tweets #tweet-' + reply.tweetId;
                                $(search).siblings('.replies')
                                    .append(renderTweet(user, reply.message, reply.id));
                            })
                        })
                })
            })

    }());

    // Expand textareas for composing
    $('#main').on('click', 'textarea', function() {
        $(this).parent().addClass('expand');
    })

    // Expand original tweets
    $('#tweets').on('click', '.thread > .tweet', function() {
        $(this).parent('.thread').toggleClass('expand');
    })  

    // Compose Function when user creates a tweet
    $('#main').on('click', '.compose button', function() {
        var $message = $(this).parents('.compose').find('textarea').val();
        var $parent = $(this).parent();
        var id = 55;

        console.log($message);
    
        if($('textarea').parent('header').length == 1) {
            console.log('here it is!');
            // renderThread(currentUser, $message, id);
            postTweet(currentUser, $message, tweetsUrl);
        } else {
            var tweetId = $(this).parents('.thread').find('.tweet').attr('id');
            postReply(currentUser, $message, repliesUrl, tweetId);
        }

        $message = $parent.siblings('textarea').val('');   // resets textarea entry
        $(this).parents('.compose').removeClass('expand'); // remove class 'expand' to close compose div
        $(this).prev('.count').text(140);                  // resets message character count to 140

        return false;
    });


    // render out tweet body
    function renderTweet(user, message, id) {
        var html = template.tweetTmpl({
                        id: id,
                        img: user.img,
                        handle: user.handle,
                        message: message
                    });

        return html;
    }

    // render out compose body
    function renderCompose() {
        var html = template.composeTmpl();

        return html;
    }

    // render out thread comprised of tweet and compose
    function renderThread(user, message, id) {
        var html = template.threadTmpl({
                        tweet: renderTweet(user, message, id),
                        compose: renderCompose()                    
                    });

        return html;
    }

    function postTweet(user, message, url) {
        $.post(tweetsUrl, {
            userId: user.id,
            message: message
        }).done(function(data) {
            var html = renderTweet(user, data.message, data.id);
            $('#tweets').append(html);
        })
    }

    function postReply(user, message, url, tweetId) {
        $.post(repliesUrl, {
            userId: user.id,
            tweetId: tweetId.slice(6),
            message: message
        }).done(function(data) {
            console.log(data);
            var html = renderTweet(user, data.message, data.id);
            $('#' + tweetId).siblings('.replies').append(html);
        })
    }

});