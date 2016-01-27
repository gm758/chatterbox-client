var spammers = [];

var request = function(requestType, data, successCb) {
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

request('GET', {'order':'-createdAt', 'limit':1000}, function(data) {
  var users = _.groupBy(data.results, 'username');
  console.log(spammers);
});


var nameToDelete = 'AllenBot';

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


var deletedata = {
    'limit':1000,
    'where': {username: nameToDelete}
};


var getSuccess = function(data) {
    console.log(data)
    window.results = data.results;
    doDelete();
};


var deleteSuccess = function(data) {console.log(data)}

window.app.request('GET', deletedata, getSuccess)

function doDelete() {
    for (var i = 0; i < window.results.length; i++) {
        var id = window.results[i].objectId;
        deleterequest(id, {},  deleteSuccess);
        console.log('deleting ' + id)
        sleep(200);
    }
}

var deleterequest = function(id, data, successCb) {
  var req = {
    url: 'https://api.parse.com/1/classes/chatterbox/' + id,
    type: 'DELETE',
    data: data,
    success: successCb,
    error: function () {
      console.error('chatterbox: ajax request failed');
    }
  };
  $.ajax(req);
};