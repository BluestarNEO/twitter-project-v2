'use strict'

var template = require('./template.js');
var $ = require('jquery');
var apiUrl = 'http://localhost:3000/';

$(function () {

  // User is set to empty by default
  var currentUser = {};
  var getUsers = $.get(apiUrl + 'users');

  // Load existing database content on page
  loadTweets();
  loadUsers();

  // Select user and load them into currentUser
  $('#user-select').change(function() {
    var userSelected = $('#user-select').val();
    $.get(apiUrl + 'users/' + userSelected)
      .done(function(data) {
        currentUser = data;
      });
  });

  // Expand textareas for composing
  $('#main').on('click', '.compose', function() {
    var composeBtn = $(this).find('button');

    $(this).addClass('expand');
    if ($.isEmptyObject(currentUser)) {
      disabledBtn(composeBtn);
    } else {
      enabledBtn(composeBtn);
    }
  });

  // Expand original tweets
  $('#tweets').on('click', '.thread > .tweet', function() {
    $(this).parent('.thread').toggleClass('expand');
  });  

  // Compose Function when user creates a tweet
  $('#main').on('click', '.compose button', function() {
    var $message = $(this).parents('.compose').find('textarea').val();
    var $parent = $(this).parent();
  
    if($(this).parents('header').length) {
      postTweet(currentUser, $message);
    } else {
      var tweetId = $(this).parents('.thread').find('.tweet').attr('id');
      var replyHandle = '';
      replyHandle = $(this).parents('.thread').find('.tweet:first-child .title').text();
      postReply(currentUser, $message, tweetId, replyHandle);
    }

    $message = $parent.siblings('textarea').val('');   // resets textarea entry
    $(this).parents('.compose').removeClass('expand'); // remove class 'expand' to close compose div
    $(this).prev('.count').text(140);                  // resets message character count to 140

    return false;
  });

  // Character count decrementer and stylings while checking if there is an active user
  $('#main').on('keyup', 'textarea', function() {
    var $msgCount = $(this).val().length;
    var $limitCount = $('textarea').siblings('div').find('.count');
    var $composeBtn = $(this).siblings('div').find('button');

    $limitCount.text(140 - ($msgCount));
    
    if ($.isEmptyObject(currentUser)) {
      disabledBtn($composeBtn);
      if ($msgCount > 140) {
        $limitCount.css({"color": "red", "background-color": "pink"});
        $(this).css({"color": "red"});
      } else {
        $limitCount.css({"color": "#777", "background-color": "transparent"});
        $(this).css({"color": "#777"});
      }
    } else {
      if ($msgCount > 140) {
        $limitCount.css({"color": "red", "background-color": "pink"});
        $(this).css({"color": "red"});
        disabledBtn(composeBtn);
      } else {
        $limitCount.css({"color": "#777", "background-color": "transparent"});
        $(this).css({"color": "#777"});
        enabledBtn($composeBtn);
      }
    }    
  });

  // Disable functionality of button
  function disabledBtn(btn) {
    return btn.attr('disabled', true).css({"background-color": "rgba(46,154,194,0.4)"});
  };

  // Enable functionality of button
  function enabledBtn(btn) {
    return btn.attr('disabled', false).css({"background-color": "#2E9AC2"});
  };

  // Render out tweet body
  function renderTweet(user, tweet) {
    var html = template.tweetTmpl({
      id: tweet.id,
      img: user.img,
      handle: user.handle,
      message: tweet.message
    });

    return html;
  };

  // Render out compose body
  function renderCompose() {
    var html = template.composeTmpl();

    return html;
  };

  // Render out thread comprised of tweet and compose
  function renderThread(user, tweet) {
    var html = template.threadTmpl({
      tweet: renderTweet(user, tweet),
      compose: renderCompose()                    
    });

    return html;
  };

  // Post original tweet and render out new thread
  function postTweet(user, message) {
    $.post(apiUrl + 'tweets', {
      userId: user.id,
      message: message
    }).done(function(data) {
      var html = renderThread(user, data);
      $('#tweets').append(html);
    });
  };

  // Post reply and render out reply tweet
  function postReply(user, message, tweetId, replyHandle) {
    $.post(apiUrl + 'replies', {
      userId: user.id,
      tweetId: tweetId.slice(6),
      message: replyHandle + ' ' + message
    }).done(function(data) {
      var html = renderTweet(user, data);
      $('#' + tweetId).siblings('.replies').append(html);
    });
  };

  function loadTweets(){
    getUsers()
      .done(getUserTweets)
      .done(getUserReplies)
      .fail(function(err) {
        console.log('There was an error loading the tweets');
      })
  };

  // Return http://localhost:3000/users
  function getUsers() {
    return $.get(apiUrl + 'users');
  };

  // Return http://localhost:3000/tweets
  function getTweets() {
    return $.get(apiUrl + 'tweets');
  };

  // Return http://localhost:3000/replies
  function getReplies() {
    return $.get(apiUrl + 'replies');
  };

  // Sort tweets and append the original tweets in a thread format
  function appendTweets(tweets) {
    tweets
      .sort(function(tweets1, tweets2) {
        return tweets1.id - tweets2.id;
      })
      .forEach(function(tweet){
          $('#tweets').append(renderThread(tweet, tweet));      
      });
  };

  // Look for original tweet ids and append corresponding replies
  function appendReplies(replies, user) {
    replies.forEach(function(reply) {
      var search = '#tweets #tweet-' + reply.tweetId;
      $(search).siblings('.replies')
        .append(renderTweet(user, reply))
    });
  };

  // Grab original tweets then filter through and assign properties to tweets to be appended
  function getUserTweets(users) { 
    getTweets()
      .done(function(tweets) {
          for (var i = 0; i < users.length; i++) {
            for (var j = 0; j < tweets.length; j++) {
              if (users[i].id === tweets[j].userId){
                tweets[j].handle  = users[i].handle;
                tweets[j].img     = users[i].img;
                tweets[j].tweetId = tweets[j].id;
              }
            }
          }
          appendTweets(tweets);
      });
  };

  // Grab replies by user and append
  function getUserReplies(users) {
    users.forEach(function(user) {
      $.get(apiUrl + 'users/' + user.id + '/replies')
        .done(function(replies){
          appendReplies(replies, user)
        });
    });
  };

  // load all users into a select/option input and assign their corresponding ids as values
  function loadUsers() {    
    getUsers
      .done(function(users) {
        users.forEach(function(user) {
          $('#user-select').append('<option value ="' + user.id + '">' + user.handle + '</option>')
          return user;
        });
      });
  };

  // Create new user in the database
  function createUser(img, handle, realName) {
    $.post(apiUrl + 'users', {
      img: img,
      handle: handle,
      realName: realName
    }).fail(function(err){
      alert(err);
      console.log('There was a problem creating a new user');
    });
  };

  // manually update tweet
  function updateTweet(id, userId, message) {
    $.ajax({
      url: apiUrl + 'tweets/' + id,
      type: 'PUT',
      data: {
        id: id,
        userId: userId,
        message: message
      }
    });
  };

  // manually update reply
  function updateReply(id, userId, tweetId, message) {
    $.ajax({
      url: apiUrl + 'reples/' + id,
      type: 'PUT',
      data: {
        id: id,
        userId: userId,
        tweetId: tweetId,
        message: message
      }
    });
  };

});
