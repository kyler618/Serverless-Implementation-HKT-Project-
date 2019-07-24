var Users = window.Users || {};
var openOnce = false;
(function ($) {
  $(function onDocReady() {
    console.log(localStorage.getItem("poolData"));
    const contentBody = $( "#contentBody" );
    $('#menu-bar').on( "click", "a", event => {
      if (!_config.api.invokeUrl) {
        $('#noApiMessage').show();
      }
      let target = event.target.innerHTML;
      $('#current').html(target);
      $('#current').val(event.target.id);
      switch(target){
        case 'Job':
          contentBody.load( "job.html" );
          break;
        case 'Customer': case 'Hardware':
          contentBody.load( "database.html", () => {
            if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
            openOnce = true;
          });
          break;
        case 'Client Information':
          contentBody.load( "clientInfo.html" );
          break;
        case 'Documents':
          contentBody.load( "document.html", () => {
            $.getScript("js/document.js");
          });
          break;
      }
    });
  });
}(jQuery));
