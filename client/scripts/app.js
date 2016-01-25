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


$(document).ready(function() {
  window.app = new ChatterBox();

});