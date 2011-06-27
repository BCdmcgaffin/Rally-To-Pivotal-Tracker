function Pivotal() {
  var api_token;
  var my = {};

  my.setAPIToken = function(token) {
    api_token = token;
  };

  my.findProjects = function() {
    if (!api_token) { throw "No API Token has been set."; }
  };

  my.addStory = function(name, description) {
  };

  return my;
}
