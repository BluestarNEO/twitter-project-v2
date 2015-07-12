'use strict'


var template = require('./template');
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
        $.getJSON(usersUrl)
            .done(function(users) {
                users.forEach(function(user) {
                    $.getJSON(usersUrl + user.id + '/tweets')
                        .done(function(tweets) {
                            tweets.forEach(function(tweet) {
                                $('#tweets').append(renderThread(user, tweet.message, tweet.id));
                            })
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
        $(this).parent().addClass('expand')
    });

    // Expand original tweets
    $('#tweets').on('click', '.thread > .tweet', function() {
        $(this).parent('.thread').toggleClass('expand');
    });  

    var tweetsPrimaryId = 6;  //default new id for tweets from default db is 6 - testing only
    var repliesPrimaryId = 4; //default new id for replies from default db is 4 -testing only
    var usersPrimaryId = 4; //default new id for users from default db is 4 - testing only

     $('#main').on('click', '.compose button', function() {
        var $message = $(this).parents('.compose').find('textarea').val();

        if($('textarea').parent('header')){
            $.post('http://localhost:3000/tweets', {
                "id": tweetsPrimaryId,
                "userId": currentUser.id,
                "message": $message
            }).done(function() {
                console.log('posted');
                //renderThread(tweets, users);
            })
        } else {
            var tweetId = $(this).parents('.tweet').attr('id');
            $.post('http://localhost:3000/replies', {
                "id": repliesPrimaryId,
                "userId": currentUser.id,
                "tweetId": tweetId,
                "message": $message
            }).done(function() {
                console.log('tweet posted');
            });
        }

        tweetsPrimaryId++;
        repliesPrimaryId++;

        return false;

    })

    // Old code to use as a starting point

    // $('main').on('click', '.compose button', function() {
    //     var message = $(this).parent().siblings('textarea').val();
    //     var parent = $(this).parent();

    //     var tweet = template.renderTweet(currentUser, message);
    //     $(this).parents('.replies').append(tweet);
    
    //     // if($(this).parents('header').length == 1) {
    //     //     renderThread(User, $message);
    //     // } else {
    //     //     var tweet = renderTweet(User, $message);
    //     //     $(this).parents('.replies').append(tweet);
    //     // }

    //     message = parent.siblings('textarea').val('');   // resets textarea entry
    //     $(this).parents('.compose').removeClass('expand'); // remove class 'expand' to close compose div
    //     $(this).prev('.count').text(140);                  // resets message character count to 140

    //     return false;
    // })
    
    // var endpoint = ['users', 'tweets', 'replies'];


    // for (var i = 0; i < endpoint.length; i++){
    //     $.get('http://localhost:3000/' + endpoint[i]).done(function(data){
    //         console.log(data);
    //     })
    // }

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

});