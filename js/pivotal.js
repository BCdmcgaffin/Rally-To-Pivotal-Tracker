function Pivotal() {
  const PT_COOKIE_NAME = "PT_TOKEN";
  const PIVOTAL_BASE_URL = "https://www.pivotaltracker.com/services/v3";
  const PIVOTAL_GET_TOKENS = PIVOTAL_BASE_URL + "/tokens/active";
  const PIVOTAL_GET_PROJECTS = PIVOTAL_BASE_URL + "/projects";
  const PIVOTAL_ADD_STORY = PIVOTAL_GET_PROJECTS + "/##PROJECT_ID##/stories";
  const PIVOTAL_NEW_STORY_XML = 
          "<story><story_type>feature</story_type>" + 
            "<name>##STORY_NAME##</name>" + 
            "<description>##STORY_DESCRIPTION##</description>" +
          "</story>";

  const RALLY_DIRECT_URL = "https://rally1.rallydev.com/slm/detail/ar/";

  var COOKIE_URL = "https://rally1.rallydev.com";

  var api_token;
  var my = {};

  my.isLoggedIn = function(callback) {
    chrome.cookies.get(
        {url: COOKIE_URL, name: PT_COOKIE_NAME},
        function(cookie) {
          if (callback) { callback(cookie); }
          if (cookie) {
            api_token = cookie.value;
          }
        });
  };

  my.login = function(username, password, callback) {
    $.post(PIVOTAL_GET_TOKENS, 
          { username: username.trim(), password: password.trim() },
          function(data) {
            console.log("$.get.response: %o", data);

            api_token = $(data).find('guid').text().trim();

            if (api_token && api_token.length > 0) {
              chrome.cookies.set({
                  url: COOKIE_URL,
                  name: PT_COOKIE_NAME,
                  value: api_token
              });
              if (callback) { callback(true); }
            } else {
              if (callback) { callback(false); }
            }
          },
          'xml');
  };

  my.logout = function(callback) {
    verifyAPIToken();

    chrome.cookies.remove({url: COOKIE_URL, name: PT_COOKIE_NAME});
    if (callback) { callback(); }
  };

  my.findProjects = function(callback) {
    verifyAPIToken();

    $.ajax(PIVOTAL_GET_PROJECTS, {
      headers: { 'X-TrackerToken': api_token},
      dataType: 'xml',
      success: function(data, textStatus, jqXHR) {
        console.log("success: %o", data);

        var projects = [];
        $(data).find('project').each(function(p) {
              projects.push({
                id: $($(this).children()[0]).text(),
                name: $($(this).children()[1]).text()
              });
            });

        if (callback) { callback(projects); }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("error: %o", errorThrown);
        if (callback) { callback(textStatus); }
      }
    });
  };

  my.addStory = function(rally_story, pivotal_project, callback) {
    verifyAPIToken();
    
    var request = PIVOTAL_ADD_STORY.replace("##PROJECT_ID##", pivotal_project.id);
    var story_data = prepareStoryData(rally_story);

    $.ajax(request, {
      headers: { 'X-TrackerToken': api_token},
      type: 'POST',
      data: story_data,
      contentType: 'application/xml',
      dataType: 'xml',
      success: function(data, textStatus, jqXHR) {
        if (callback) { callback(data); }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("error: %o", errorThrown);
        if (callback) { callback(textStatus); }
      }
    });
  };

  // private functions
  function prepareStoryData(rally_story) {
    var description =  RALLY_DIRECT_URL + rally_story.ObjectID + "\n\n" + escapeHTML(rally_story.Description);
    var story_data = PIVOTAL_NEW_STORY_XML.replace("##STORY_NAME##", rally_story.Name);
    story_data = story_data.replace("##STORY_DESCRIPTION##", description);

    return story_data;
  }

  function escapeHTML(content)  {
    return $("<div/>").text(content).html();
  }
  
  function verifyAPIToken() {
    if (!api_token) { throw "No API Token has been set."; }
  }

  return my;
}
