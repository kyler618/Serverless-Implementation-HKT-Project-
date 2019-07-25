var Users = window.Users || {};

Users.authToken.then( token => {
  if (token) {
    function handleResponse(results){
      console.log(results);
    }
    let user = jwt_decode(token);
    // let data = {operation: "getMaintenanceRecord", target:user['cognito:username']};
    let data = {operation: "scan"};
    var httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl +'/hkt-fieldeng-resource',
      headers: {Authorization: token},
      contentType: 'application/json',
      data : JSON.stringify(data),
      async: true,
      success: handleResponse,
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured:\n' + jqXHR.responseText);
      }
    };
    console.log(httpRequest);
    $.ajax(httpRequest);
  }
  else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});
