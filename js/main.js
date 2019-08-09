var Users = window.Users || {};
var openOnce = false;

// (function ($) {
  Users.authToken.then((token) => {   // check user authority
    if (token) {
      identityCode = jwt_decode(token).iss.replace('https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_', '');
      $(function onDocReady() {
        $('#Menu-bar').on( "click", "a", itemClick);
        let path = window.location.href;
        path = path.slice(path.lastIndexOf("#") + 1, path.length);
        if( path != "https://itletsgo.github.io/main.html" ){
          switch (identityCode){
            case 'DevfD3lWf':
              $('#support-Line-Information').show();
              break;
            case 'p7IxZwAdF':
              $('#job').show();
              break;
          }
          path = "#" + path;
          console.log(path);
          $(path).click();
        }
        else{
          switch (identityCode){
          case 'DevfD3lWf':
            $('#support-Line-Information').show();
            $('#customer-and-Software').click();
            break;
          case 'p7IxZwAdF':
            $('#job').show().click();
            break;
        }
        }
      });
    }
    else{
      Users.signOut();
    }
  }).catch((error) => {
    console.log(error);
    window.location.href = '/signin.html';
  });
// }(jQuery));
function itemClick(event){
  $('#Menu-bar a').css('color', 'inherit');
  $(event.target).css('color', 'yellow');
  if (!_config.api.invokeUrl) {
    $('#noApiMessage').show();
  }
  let target = event.target.innerHTML;
  if( $('#current').html() == target ) {
    return;
  }
  $('#current').html(target);
  $('#current').val(event.target.id);
  switch(target){
    case 'Job':
      window.history.pushState(null, null, "main.html#job");
      if(identityCode=="p7IxZwAdF"){
        $( "#contentBody" ).load( "job.html" );
      }
      break;
    case 'Customer and Software':
      window.history.pushState(null, null, "main.html#customer-and-software");
      $( "#contentBody" ).load( "database.html", () => {
        if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
        openOnce = true;
      });
      break;
    case 'Hardware':
      window.history.pushState(null, null, "main.html#hardware");
      $( "#contentBody" ).load( "database.html", () => {
        if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
        openOnce = true;
        if( identityCode=='DevfD3lWf' )
        $('#maintain').addClass('maintain');
      });
      break;
    case 'Client Information':
      window.history.pushState(null, null, "main.html#client-infomation");
      $( "#contentBody" ).load( "clientInfo.html" );
      break;
    case 'Client Information':
      window.history.pushState(null, null, "main.html#support-line-information");
      break;
    case 'Documents':
      window.history.pushState(null, null, "main.html#documents");
      $( "#contentBody" ).load( "document.html", () => {
        $.getScript("js/document.js");
      });
      break;
    case 'Sign out':
      Users.signOut();
      break;
  }
}
