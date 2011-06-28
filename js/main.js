$(function() {

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
    $("#link_status").show();

    addStatusMsg("searching for US10061");
    rally_connector.findUserStory(story_id, function(result) {
          if (result.error) {
            console.error("findUserStory returned an error: %o", result);
            addStatusMsg("could not find " + story_id);
          } else {
            var story = result;
            
            name = story.Name;
            description = story.Description;
            
            addStatusMsg("found rally user story: " + story_id);
            linkStoryToPivotal(result.user_story);
          }
        });
  }

  // Add Rally story to Pivotal Tracker
  // @param story:
  //          ObjectID       1010101
  //          Name           Some Story Name
  //          Description    ...description of story...
  //          FormattedID    US16001
  //          URL:           https://rally1.rallydev.com/slm/detail/ar/3068546025
  //
  function linkStoryToPivotal(story) {
    addStatusMsg("adding story to Pivotal Tracker.");
    pivotal_connector.findProjects(function(projects) {
          console.log("findProject result from connector: %o", projects);
          if (projects.length == 1) {
            pivotal_connector.addStory(story, projects[0]);
          } else {
            console.error("There are more projects than the 1 that I was expecting: %o", projects);
          }
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

  // make this function global
  function addStatusMsg(msg) {
    $("#status_msgs").append("<div>" + msg + "</div>");
  }
});
