function Rally() {
  var RALLY_US_API = "https://rally1.rallydev.com/slm/webservice/1.24/hierarchicalrequirement.js";
  var UPDATE_STORY = "https://rally1.rallydev.com/slm/webservice/1.24/hierarchicalrequirement/##STORY_ID##"

  
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

  my.updateUserStoryWithPivotalLink = function(rally_story, pivotal_url, callback) {
    var request_url = UPDATE_STORY.replace("##STORY_ID##", rally_story.ObjectID);
    var description = rally_story.Description + "<br/><br/><b>pivotal story:</b> <a href='" + pivotal_url + "'>" + pivotal_url + "</a>";

    $.ajax(request_url, { 
            headers: { 'Content-Type': 'text/xml;charset=utf-8' },
            type: 'POST',
            data: "<?xml version='1.0' encoding='UTF-8'?>" + 
              "<HierarchicalRequirement><Description><![CDATA[" + 
                description + 
              "]]></Description></HierarchicalRequirement>",
            dataType: 'xml',
            success: function(data, textStatus, jqXHR) {
              console.log('updating rally story with: ' + description);
              if (callback) { callback(data); }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              console.error("error: %o", errorThrown);
              if (callback) { callback(textStatus); }
            }
          });
  };


  return my;
};
