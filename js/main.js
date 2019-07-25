var Users = window.Users || {};
var openOnce = false;
console.log('version 1');
(function ($) {
  Users.authToken.then((token) => {   // check user authority
    if (token) {
      let identityCode = jwt_decode(token).iss.replace('https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_', '');
      $(function onDocReady() {
        switch (identityCode){
          case '8oxVNNeyb':

            break;
          case 'InROTeRsW':
            $('#Job').show();
            break;
        }
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
              if(identityCode=="InROTeRsW"){
                contentBody.load( "job.html" );                
              }
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
    }
    else{
      // window.location.href = '/signin.html';
    }
  }).catch((error) => {
    console.log(error);
    // siginout
  });
}(jQuery));
