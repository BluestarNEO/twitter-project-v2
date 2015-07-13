'use strict'


var template = require('./template.js');
var $ = require('jquery');

$(function () {

    // var currentUser = {
    //     id: 1,
    //     img: '../images/brad.png',
    //     handle: '@bradwestfall',
    //     realName: 'Brad Westfall'
    // };

    var repliesUrl = "http://localhost:3000/replies/";
    var tweetsUrl = "http://localhost:3000/tweets/";
    var usersUrl = "http://localhost:3000/users/";

    // Load existing database content on page
    loadTweets();
    loadUsers();

    // var currentUser = $('#user-select').val();
    // console.log(currentUser);

    $('#user-select').change(function() {
        var currentUser = $('#user-select').val();

        $.getJSON(usersUrl + currentUser)
            .done(function(userData) {

            });

    })

    // Expand textareas for composing
    $('#main').on('click', 'form', function() {
        $(this).addClass('expand');
    })

    // Expand original tweets
    $('#tweets').on('click', '.thread > .tweet', function() {
        $(this).parent('.thread').toggleClass('expand');
    })  

    // Compose Function when user creates a tweet
    $('#main').on('click', '.compose button', function() {
        var $message = $(this).parents('.compose').find('textarea').val();
        var $parent = $(this).parent();
    
        if($(this).parents('header').length) {
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

    // Character count decrementer and stylings
    $('#main').on('keyup', 'textarea', function() {
        var $msgCount = $(this).val().length;
        var $limitCount = $('textarea').siblings('div').children('.count');

        $limitCount.text(140 - ($msgCount));

        if ($msgCount > 140) {
            $limitCount.css({"color": "red", "background-color": "pink"});
            $(this).css({"color": "red"});
            $(this).siblings('div').children('button').attr('disabled', true).css({"background-color": "rgba(46,154,194,0.4)"});

        } else {
            $limitCount.css({"color": "#777", "background-color": "transparent"});
            $(this).css({"color": "#777"});
            $(this).siblings('div').children('button').attr('disabled', false).css({"background-color": "#2E9AC2"});
        }
    })

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

    // post original tweet and render out new thread
    function postTweet(user, message, url) {
        $.post(tweetsUrl, {
            userId: user.id,
            message: message
        }).done(function(data) {
            var html = renderThread(user, data.message, data.id);
            $('#tweets').append(html);
        })
    }

    // post reply and render out reply tweet
    function postReply(user, message, url, tweetId) {
        $.post(repliesUrl, {
            userId: user.id,
            tweetId: tweetId.slice(6),
            message: message
        }).done(function(data) {
            var html = renderTweet(user, data.message, data.id);
            $('#' + tweetId).siblings('.replies').append(html);
        })
    }

    // load tweets and replies already stored in db.json
    function loadTweets() {
         $.getJSON(tweetsUrl)
            .done(function(tweets) {
                tweets.forEach(function(tweet) {
                    $.getJSON(usersUrl + tweet.userId, function(tweetUser) {
                            $('#tweets').append(renderThread(tweetUser, tweet.message, tweet.id));                            
                        });
               })
            })

        $.getJSON(usersUrl)
            .done(function(users) {
                users.forEach(function(user) {
                    $.getJSON(usersUrl  +  user.id + '/replies')
                        .done(function(replies) {
                            replies.forEach(function(reply) {
                                var search = '#tweets #tweet-' + reply.tweetId;
                                $(search).siblings('.replies')
                                    .append(renderTweet(user, reply.message, reply.id));
                            })
                        })
                })
            })
    };

    function loadUsers() {
        $.getJSON(usersUrl) 
            .done(function(users) {
                users.forEach(function(user) {
                    $('#user-select').append('<option value ="' + user.id + '">' + user.handle + '</option>')
                    return user;
                })
            })
    }

});
