function Pivotal() {
  var PT_COOKIE_NAME = "PT_TOKEN";
  var PIVOTAL_GET_TOKENS = "https://www.pivotaltracker.com/services/v3/tokens/active";
  var PIVOTAL_GET_PROJECTS = "https://www.pivotaltracker.com/services/v3/projects";

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
          console.log("cookie callback: %o", cookie);
          callback(cookie);
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
              callback(true);
            } else {
              callback(false);
            }
          },
          'xml');
    console.log("sent request to pivotal");
  };

  my.logout = function(callback) {
    verifyAPIToken();

    chrome.cookies.remove({url: COOKIE_URL, name: PT_COOKIE_NAME});
    callback();
  };

  my.findProjects = function(callback) {
    verifyAPIToken();

    $.ajax(PIVOTAL_GET_PROJECTS, {
        headers: { 'X-TrackerToken': api_token},
        dataType: 'xml',
        success: function(data, textStatus, jqXHR) {
          console.log("success: %o", data);
          callback(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error("error: %o", errorThrown);
          callback(textStatus);
        }
      });
  };

  my.addStory = function(rally_id, name, description, link, callback) {
    verifyAPIToken();
  };

  return my;
}
