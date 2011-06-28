function Rally() {
  var RALLY_US_API = "https://rally1.rallydev.com/slm/webservice/1.24/hierarchicalrequirement.js";
  var USER_STORY_QUERY = "(FormattedID%20=%20USXXXXX)";

  var my = {};

  my.findUserStory = function(story_id, callback) {

    var user_story_query = USER_STORY_QUERY.replace("USXXXXX", story_id); 
    console.log("linking story: %s with url: %s", story_id, user_story_query);
    $.getJSON(RALLY_US_API, 
        "query=" + user_story_query + "&fetch=true",
        function(data) {
          console.log("response: %o", data);
          if (data.QueryResult.Errors.length > 0 ||
              data.QueryResult.Results.length == 0) {
            callback({
                error: data.QueryResults.Errors
              });
            return;
          } 

          callback({
              error: null,
              user_story: data.QueryResult.Results[0]
            });
        });
  };

  my.updateUserStory = function(story_id, name, description, onResult) {
  };


  return my;
};
