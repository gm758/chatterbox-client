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
  this.username = username || 'anon';
  this.currentRoom = 'lobby';
  this.messages = [];
  this.rooms = [];
};

ChatterBox.prototype.init = function() {
  var app = this;
  // click friends names to add to friend list
  $('body').on('click', '.username', function() {
    app.addFriend($(this).text());
    
  });

  //submit new room for creation
  $('body').on('submit', '#add-room', function(e) {
    e.preventDefault();
    app.addNewRoom($('#new-room').val());
    $('#add-room').fadeOut();
    $('.roomName').text("room: " + app.currentRoom);

  });

  //submit new message to post to server
  $('#send').on('submit', function(e) {
    e.preventDefault();
    app.handleSubmit($('#message').val());
    $('#message').val('');
  });

  //select room whose message to view
  $('#roomSelect').on('change', function() {
    app.currentRoom = $(this).val();
    app.currentFriend = null;
    if (app.currentRoom === 'addRoom') {
      $('#add-room').fadeIn();
    } else {
      $('.roomName').text("room: " + app.currentRoom);
      app.fetch();
    }
  });

  //select friend to view messages of
  $('#friendSelect').on('change', function() {
    app.currentFriend = $(this).val();
    
    $('.roomName').text("friend: " + app.currentFriend);
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


ChatterBox.prototype.send = function(message) {
  var app = this;
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      app.fetch();
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
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

    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: {
        "limit":1000,
        "order":"-updatedAt",
        'where': where
      },
      success : function(data) {
        app.messages = data.results;
        app.clearMessages();
        // var messagesInRoom = app.rooms[app.currentRoom];
        _.each(app.messages, function(message) {
          app.addMessage(message);
        });

      }
    });
};

ChatterBox.prototype.fetchRooms = function() { //TO DO: Optimize fetch to only call room data
    var app = this;
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: {
        'limit': 1000,
        'keys': 'roomname'
      },
      success : function(data) {
        app.roomNames = _.groupBy(data.results, 'roomname');
        $('#roomSelect').html('<option value="addRoom">...add a room</option>');
        for (var room in app.roomNames) {
          app.addRoom(room);
        }
        $('#roomSelect').val(app.currentRoom);
      }
    });
};

ChatterBox.prototype.clearMessages = function() {
  $('#chats').html('');
};

ChatterBox.prototype.addMessage = function(message) {
  var $message = $('<div class="chat"></div>');
  var $username = $('<span class="username"></span>');
  var $messageText = $('<span class="text"></span>');
  var $time = $('<span class="time"></span>');
  $username.text(message.username);
  $messageText.text(message.text);
  if (message.username in this.friends) {
    $messageText.addClass('friended');
  }
  var timeText = moment(message.updatedAt, moment.ISO_8601).fromNow();
  //console.log(timeText);
  $time.text(timeText);
  $message.append($username).append($messageText).append($time);
  $('#chats').append($message);
};

ChatterBox.prototype.addRoom = function(roomName) {
  var $option = $('<option></option>');
  $option.text(roomName);
  $option.val(roomName);
  $('#roomSelect').append($option);
};

ChatterBox.prototype.addFriend = function(username) {
  if (!(username in this.friends)) {
    this.friends[username] = true;
  }
  $('#friendSelect').html('<option></option>');
  for (var friend in this.friends) {
    var $option = $('<option></option>');
    $option.text(friend);
    $option.val(friend);
    $('#friendSelect').append($option);
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
  window.app = new ChatterBox(getQueryVariable('username'));
  app.init();

  setInterval(app.fetch.bind(app), 5000);

});








