window.getQueryVariable = function(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){
      return pair[1];
    }
  }
  return false;
};

var ChatterBox = function(username) {
  this.friends = {};
  this.currentFriend = null;
  this.mentioned = null;
  this.username = username || 'anon';
  this.currentRoom = 'lobby';
  this.messages = [];
  this.refresh = this.fetch;
  this.allUsers = [];
};

ChatterBox.prototype.init = function() {
  var app = this;

  app.addFriend(app.username);

  // click friends names to add to friend list
  $('body').on('click', '.username', function() {
    app.addFriend($(this).text());
    
  });

  //display mentions of clicked @tag
  $('body').on('click', '.at-mention', function() {
      app.mentioned = $(this).text().slice(1);
      app.currentFriend = null;
      app.refresh = app.fetchMentions;
      $('#friendSelect button').removeClass('btn-success').addClass('btn-default');
      $('.roomName').text("posts @ " + app.mentioned);
      $('.submission').slideUp();
      app.fetchMentions();
  });

  //submit new room for creation
  $('body').on('submit', '#add-room', function(e) {
    e.preventDefault();
    app.addNewRoom($('#new-room').val());
    $('#add-room').fadeOut();
    $('.roomName').text("room: " + app.currentRoom);
    $('.submission').slideDown();
  });

  //submit new message to post to server
  $('#send').on('submit', function(e) {
    e.preventDefault();
    app.handleSubmit($('#message').val());
    $('#message').val('');
  });

  //select room whose message to view
  $('#roomSelect').on('click', 'a', function() {
    app.refresh = app.fetch;
    $('.submission').slideDown();
    $('#friendSelect button').removeClass('btn-success').addClass('btn-default');
    app.currentRoom = $(this).text();
    app.currentFriend = null;
    if (app.currentRoom === 'add a room') {
      $('#add-room').fadeIn().css('display','inline-block');
    } else {
      $('.roomName').text("room: " + app.currentRoom);
      app.fetch();
    }
  });

  //select friend to view messages of
  $('#friendSelect').on('click', 'button', function() {
    app.currentFriend = $(this).text();
    app.refresh = app.fetch;
    $('#friendSelect button').removeClass('btn-success').addClass('btn-default');
    $(this).removeClass('btn-default').addClass('btn-success');
    $('.roomName').text("friend: " + app.currentFriend);
    $('.submission').slideUp();
    app.fetch();
  });
  
   //select friend to view messages of
  $('#users').on('click', 'a', function() {
    app.currentFriend = $(this).text();
    app.refresh = app.fetch;
    $('#friendSelect button').removeClass('btn-success').addClass('btn-default');
    $('.roomName').text("user: " + app.currentFriend);
    $('.submission').slideUp();
    app.fetch();
  });
  

  $('.roomName').text("room: " + app.currentRoom);
  this.fetch();
};

ChatterBox.prototype.addNewRoom = function(roomName) {
  var welcomeMessage = {
    username: 'chatterbox',
    text: 'Welcome to ' + roomName,
    roomname: roomName
  };
  this.currentRoom = roomName;
  this.send(welcomeMessage);
};

ChatterBox.prototype.request = function(requestType, data, successCb) {
  var req = {
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: requestType,
    data: data,
    success: successCb,
    error: function () {
      console.error('chatterbox: ajax request failed');
    }
  };
  $.ajax(req);
};


ChatterBox.prototype.send = function(message) {
  var app = this;
  var data = JSON.stringify(message);
  var success = function (data) {
    console.log('chatterbox: Message sent');
    app.fetch();
  };

  this.request('POST', data, success);

};

ChatterBox.prototype.fetchMentions = function() {
  this.fetchRooms();
  var app = this;

  var data = {
    "limit":1000,
    "order":"-updatedAt"
  };

  $('body').addClass('wait');

  var success = function(data) {
    var mentions = _.filter(data.results, function(obj) {
      var testString = '@'+app.mentioned;
      return obj.text && obj.text.indexOf(testString) !== -1;
    });
    app.messages = mentions;
    app.clearMessages();
    _.each(app.messages, function(message) {
      app.addMessage(message);
    });
    $('body').removeClass('wait');
  };

  this.request('GET', data, success);
};

ChatterBox.prototype.fetch = function() { //TO DO: Optimize fetch to only call room data
  this.fetchRooms();
  var app = this;
  var where = {};
  if (this.currentFriend) {
    where.username = this.currentFriend;
  } else if (this.currentRoom) {
    where.roomname = this.currentRoom;
  } 

  var data = {
    "limit":1000,
    "order":"-updatedAt",
    'where': where
  };

  $('body').addClass('wait');
  var success = function(data) {
    app.allUsers = [];
    app.messages = data.results;
    app.clearMessages();
    _.each(app.messages, function(message) {
      app.addMessage(message);
      // var username = message.username;
      // app.allUsers[username] = app.allUsers[username] || 0;
      // app.allUsers[username]++;
    });

    $('body').removeClass('wait');
  };

  this.request('GET', data, success);
};

ChatterBox.prototype.fetchRooms = function() { //TO DO: Optimize fetch to only call room data

  var app = this;
  app.fetchUsers();
  var data = {
    limit: 1000,
    "order":"-updatedAt",
    keys: 'roomname'
  };
  var success = function(data) {
    app.roomNames = _.groupBy(data.results, 'roomname');
    $('#roomSelect').html('<li><a href="#">add a room</a></li><li class="divider"></li>');
    for (var room in app.roomNames) {
      app.addRoom(room);
    }
    $('#roomSelect').val(app.currentRoom);
  };

  this.request('GET', data, success);
};

ChatterBox.prototype.fetchUsers = function() { //TO DO: Optimize fetch to only call room data
  var app = this;
  var data = {
    limit: 1000,
    "order":"-updatedAt",
  };
  var success = function(data) {
    app.allUsers = Object.keys(_.groupBy(data.results, 'username'));
    app.allUsers = app.allUsers.sort();
    $('#users').html('');

    for (var i = 0; i < app.allUsers.length; i++) {
      var $li = $('<li></li>');
      var $userlink = $('<a href="#"></a>');
      $userlink.text(app.allUsers[i]);
      $('#users').append($li).append($userlink);
    
    }
  };

  this.request('GET', data, success);
};


ChatterBox.prototype.clearMessages = function() {
  $('#chats').html('');
};

ChatterBox.prototype.addMessage = function(message) {


  var $message = $('<div class="panel panel-default chat"></div>');
  var $username = $('<strong class="username text-primary"></strong>');
  var $usernameLink = $('<a href="#"></a>').append($username);
  var $messageText = $('<p class="text"></p>');
  var $time = $('<span class="pull-right time small"></span>');

  $username.text(message.username);
  $messageText.text(message.text);
  $messageText.html($messageText.html().replace(/(@\w+)/, '<a class="at-mention" href="#">$1</a>'));
  
  if (message.username in this.friends) {
    $messageText.addClass('friended');
  }
  var timeText = moment(message.updatedAt, moment.ISO_8601).fromNow();
  $time.text(timeText);
  //console.log(timeText);
  $message.append($usernameLink).append($time).append($messageText);
  $('#chats').append($message);
};

ChatterBox.prototype.addRoom = function(roomName) {
  var $li = $('<li></li>');
  var $a = $('<a href="#"></a>');
  $a.text(roomName);
  $li.append($a);
  $('#roomSelect').append($li);
};

ChatterBox.prototype.addFriend = function(username) {
  if (!(username in this.friends)) {
    this.friends[username] = true;
  }
  $('#friendSelect').html('');
  for (var friend in this.friends) {
    var $button = $('<button type="button" class="btn btn-default"></button>');
    $button.text(friend);
    $('#friendSelect').append($button);
  }
};

ChatterBox.prototype.handleSubmit = function(message) {
  var messageObj = {
    username: this.username,
    text: message,
    roomname: this.currentRoom
  };
  this.send(messageObj);
};

$(document).ready(function() {
  tabTemplate = $('body').html();
  window.app = new ChatterBox(getQueryVariable('username'));
  app.init();


  setInterval(function() {
    app.refresh();
  }, 5000);

});








