$(function() {

  var RALLY_US_API = "https://rally1.rallydev.com/slm/webservice/1.24/hierarchicalrequirement.js";

  var USER_STORY_QUERY = "(FormattedID%20=%20USXXXXX)";

  $("#login_button").click(onLogin);

  $("#link_button").click(onLink);
  $("#reset_link").click(onReset);

  $("#logout_link").click(onLogout);

  var pivotal_connector = new Pivotal();
  var rally_connector = new Rally();

  pivotal_connector.isLoggedIn(function(cookie) {
    if (cookie) {
      setTimeout(showLinkView, 100);
    } else {
      setTimeout(showLoginView, 100);
    }
  });

  function onLogin(event) {
    console.log("onLogin was pressed");
    pivotal_connector.login($('#username').val(), $('#password').val(), 
        function(success) {
          if (success) {
            showLinkView();
          } else {
            console.error("could not login for some reason");
          }
        });
  }

  function showLinkView() {
    $("#form").hide();
    $("#status_img").attr("src", "images/logged_in.png");
    $("#link_form").fadeIn();
  }

  function showLoginView() {
    $("#link_form").hide();
    $("#status_img").attr("src", "images/logged_out.png");
    $("#form").fadeIn();
  }

  function disableLinkForm() {
    $("#user_story").attr("disabled", "true");
    $("#link_button").attr("disabled", "true");
  }

  function enableLinkForm() {
    $("#user_story").removeAttr("disabled");
    $("#link_button").removeAttr("disabled");
  }

  function onLink() {
    disableLinkForm();
    
    var story_id = $("#user_story").val().trim();

    var user_story_query = USER_STORY_QUERY.replace("USXXXXX", story_id); 
    console.log("linking story: %s with url: %s", story_id, user_story_query);

    $("#link_status").show();

    addStatusMsg("searching for US10061");
    $.getJSON(RALLY_US_API, 
        "query=" + user_story_query + "&fetch=true",
        function(data) {
          var name, description;
        
          console.log("response: %o", data);
          if (data.QueryResult.Errors.length > 0 ||
              data.QueryResult.Results.length == 0) {
            addStatusMsg("could not find " + story_id);
          } else {
            var story = data.QueryResult.Results[0];
            
            name = story.Name;
            description = story.Description;
            
            addStatusMsg("found rally user story: " + story_id);
            linkStoryToPivotal(story);
          }
           
          console.log('response from user_story query: %o', data);
        });
  }

  function addStatusMsg(msg) {
    $("#status_msgs").append("<div>" + msg + "</div>");
  }

  function linkStoryToPivotal(story) {
    addStatusMsg("adding story to Pivotal Tracker.");
    pivotal_connector.findProjects(function(result) {
          console.log("findProject result from connector: %o", result);
        });
  }
  
  function onLogout() {
    console.log('onLogout');
    pivotal_connector.logout(function() {
      showLoginView();
    });
  }

  function onReset() {
    enableLinkForm();
    $("#user_story").val("").focus();
    $("#status_msgs").empty();
    $("#link_status").hide();
  }
});
