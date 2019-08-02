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
              window.history.pushState({ foo: "job" }, "job", "job.html");
              if(identityCode=="p7IxZwAdF"){
                contentBody.load( "job.html" );
              }
              break;
            case 'Customer':
              window.history.pushState(null, null, "customer.html");
              contentBody.load( "database.html", () => {
                if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
                openOnce = true;
              });
              break;
            case 'Hardware':
              window.history.pushState(null, null, "hardware.html");
              contentBody.load( "database.html", () => {
                if(openOnce) $.getScript("https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.4.0/js/bootstrap4-toggle.min.js"); // it is a bug
                openOnce = true;
              });
              break;
            case 'Client Information':
              window.history.pushState(null, null, "ClientInfomation.html");
              contentBody.load( "clientInfo.html" );
              break;
            case 'Documents':
              window.history.pushState(null, null, "documents.html");
              contentBody.load( "document.html", () => {
                $.getScript("js/document.js");
              });
              break;
            case 'Sign out':
              Users.signOut();
              break;
          }
        });
        console.log(window.location.href);
        switch (identityCode){
          case 'DevfD3lWf':
            $('#support_Line_Information').show();
            $('#Customer_and_Software').click();
            break;
          case 'p7IxZwAdF':
            $('#Job').show().click();
            break;
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
