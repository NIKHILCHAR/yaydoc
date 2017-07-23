/**
 * Client-side Event Handling for deploy/heroku
 */
$(function () {
  var socket = io();

  /**
   * Validating Heroku App Name on keyup
   */
  $("#herokuAppName").keyup(function () {
    validation.validateHerokuAppName($("#herokuAppName").val());
  });

  /**
   * Handling Heroku deployment
   */
  $("#btnRun").click(function () {
    var herokuAppName = $("#herokuAppName").val().trim();

    validation.setMessages([]);
    var status = validation.validateHerokuAppName(herokuAppName);
    if (status !== "valid") {
      styles.showNotification(validation.getMessages());
      validation.setMessages([]);
    }
    if (status !== "invalid") {
      $(this).attr("disabled", "none");
      data.herokuAppName = herokuAppName;
      socket.emit('heroku-deploy', data);
    }
  });

  /**
   * Retrieving standard logs from Heroku deployment
   */
  socket.on('heroku-deploy-logs', function (data) {
    $('#messages').append($('<li class="info-logs">').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });

  /**
   * Retrieving erroneous logs from Heroku deployment
   */
  socket.on('heroku-error-logs', function (data) {
    $('#messages').append($('<li class="danger-logs">').text(data));
  });

  /**
   * Actions performed on a successful Heroku deployment
   */
  socket.on('heroku-success', function (data) {
    styles.showNotification("Documentation deployed successfully to Heroku!");
    $("#progress").css("width", "100%");
    $("#btnWebsiteLink").css("display", "inline").attr("href", data.url);

    $('#btnLogs').css("display", "inline");
    $("#btnLogs").click(function () {
      socket.emit('retrieve-heroku-deploy-logs', {email: data.email, uniqueId: data.uniqueId});
      $('#downloadDetailedLogs').attr('href', '/logs/heroku_deploy/' + data.email + '/' + data.uniqueId);
    });
  });

  /**
   * Actions performed on a failure in Heroku deployment
   */
  socket.on('heroku-failure', function (data) {
    styles.showNotification("Failed to deploy documentation: Error " + data.code);

    $('#btnLogs').css("display", "inline");
    $("#btnLogs").click(function () {
      socket.emit('retrieve-heroku-deploy-logs', {email: data.email, uniqueId: data.uniqueId});
      $('#downloadDetailedLogs').attr('href', '/logs/heroku_deploy/' + data.email + '/' + data.uniqueId);
    });
  });

  /**
   * Displaying detailed logs in a modal
   */
  socket.on('file-content', function(data){
    new Clipboard('#copy-button');
    $('#detailed-logs').html(data);
    $('#detailed-logs-modal').modal('show');
  });

  /**
   * Notification on a successful copy operation on logs
   */
  $('#copy-button').click(function () {
    styles.showNotification('Logs copied to clipboard!');
  })
});