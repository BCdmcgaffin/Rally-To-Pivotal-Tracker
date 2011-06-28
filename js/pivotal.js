function Pivotal() {
  var api_token;
  var my = {};

  function verifyAPIToken() {
    if (!api_token) { throw "No API Token has been set."; }
  }

  my.setAPIToken = function(token) {
    api_token = token;
  };

  my.findProjects = function(onResult) {
    verifyAPIToken();
  };

  my.addStory = function(name, description) {
    verifyAPIToken();
  };

  return my;
}
