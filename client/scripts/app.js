window.getQueryVariable = function(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
};


var ChatterBox = function(username) {
  this.friendList = [];
  this.username = username || 'anon';
  this.currentRoom = 'lobby';
  this.messages = [];
  this.rooms = [];
};

ChatterBox.prototype.init = function() {
  var app = this;
  // set up username click to add friend
  $('body').on('click', '.username', function() {
    var friendName = $(this).text();
    app.addFriend(friendName);
  });

  $('#send .submit').off('submit').on('submit', function(event) {
    event.preventDefault();
    app.handleSubmit($('#message').val());
  });

  this.fetch();
};

ChatterBox.prototype.send = function(message) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

ChatterBox.prototype.fetch = function() {
    var app = this;
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      success : function(data) {
        app.messages = data.results;
        app.rooms = _.groupBy(app.messages, 'roomname');
        console.log(app.rooms);
        for (var room in app.rooms) {
          app.addRoom(room);
        }
      }
    });
};

ChatterBox.prototype.clearMessages = function() {
  $('#chats').html('');
};

ChatterBox.prototype.addMessage = function(message) {
  var $message = $('<div class="message"></div>');
  var $username = $('<span class="username"></span>');
  var $messageText = $('<span class="text"></span>');
  $username.text(message.username);
  $messageText.text(message.text);
  $message.append($username).append($messageText);
  $('#chats').append($message);
};

ChatterBox.prototype.addRoom = function(roomName) {
  var $option = $('<option></option>');
  $option.text(roomName);
  $option.val(roomName);
  $('#roomSelect').append($option);
};

ChatterBox.prototype.addFriend = function(username) {

};

ChatterBox.prototype.handleSubmit = function(message) {
  console.log('handleSubmit');
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

});