var ChatterBox = function() {

};

ChatterBox.prototype.init = function() {

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
    $.ajax({
      url: undefined,
      type: 'GET'
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


$(document).ready(function() {
  window.app = new ChatterBox();

});