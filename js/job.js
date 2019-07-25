var Users = window.Users || {};
Users.authToken.then((token) => {   // check user authority
  if (token) {
    // httpRequest.headers = {Authorization: token};
    let x = jwt_decode(token);
    console.log(x['cognito:username']);
    var httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl +'/hkt-fieldeng-resource';,
      contentType: 'application/json',
      async: true ,
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured:\n' + jqXHR.responseText);
      }
    };
  } else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});
