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

  var COOKIE_URL = "https://rally1.rallydev.com";

  var api_token;
  var my = {};

  function verifyAPIToken() {
    if (!api_token) { throw "No API Token has been set."; }
  }

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
    console.log("login to pivotal");
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
    console.log("sent request to pivotal");
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

 // my.addStory = function(rally_id, name, description, link, callback) {
  my.addStory = function(rally_story, pivotal_project, callback) {
    verifyAPIToken();
    
    console.log("about to append Rally Story, %o, to pivotal_project, %o",
                rally_story, pivotal_project);
    var request = PIVOTAL_ADD_STORY.replace("##PROJECT_ID##", pivotal_project.id);
    var story_data = PIVOTAL_NEW_STORY_XML.replace("##STORY_NAME##", rally_story.Name);
    story_data = story_data.replace("##STORY_DESCRIPTION##", rally_story.Description);


    console.log("add story request: %s", request);
    console.log("add story data: %s", story_data);
    

    $.ajax(request, {
      headers: { 'X-TrackerToken': api_token},
      type: 'POST',
      data: story_data,
      contentType: 'application/xml',
      dataType: 'xml',
      success: function(data, textStatus, jqXHR) {
        console.log("success: %o", data);

        if (callback) { callback(projects) }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("error: %o", errorThrown);
        if (callback) { callback(textStatus); }
      }
    });
  };

  return my;
}
