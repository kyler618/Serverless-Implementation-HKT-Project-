var Users = window.Users || {};
var openOnce = false;

(function ($) {
  Users.authToken.then((token) => {   // check user authority
    if (token) {
      let identityCode = jwt_decode(token).iss.replace('https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_', '');
      $(function onDocReady() {
        const contentBody = $( "#contentBody" );
        $('#Menu-bar').on( "click", "a", event => {
          if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
          }
          let target = event.target.innerHTML;
          $('#current').html(target);
          $('#current').val(event.target.id);
          switch(target){
            case 'Job':
              window.history.pushState(null, null, "job");
              if(identityCode=="p7IxZwAdF"){
                contentBody.load( "job.html" );
              }
              break;
            case 'Customer':
              window.history.pushState(null, null, "customer");
              contentBody.load( "database.html", () => {
                if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
                openOnce = true;
              });
              break;
            case 'Hardware':
              window.history.pushState(null, null, "hardware");
              contentBody.load( "database.html", () => {
                if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
                openOnce = true;
              });
              break;
            case 'Client Information':
              window.history.pushState(null, null, "client-Infomation");
              contentBody.load( "clientInfo.html" );
              break;
            case 'Documents':
              window.history.pushState(null, null, "documents");
              contentBody.load( "document.html", () => {
                $.getScript("js/document.js");
              });
              break;
            case 'Sign out':
              Users.signOut();
              break;
          }
        });
        let path = window.location.href;
        path = path.slice(path.lastIndexOf("/") + 1, path.length);
        if(path!="main.html"){
          path = "#" + path;
          $(path).click();
          switch (identityCode){
            case 'DevfD3lWf':
              $('#support_Line_Information').show();
              break;
            case 'p7IxZwAdF':
              $('#Job').show();
              break;
          }
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
    // window.location.href = '/signin.html';
  });
}(jQuery));
