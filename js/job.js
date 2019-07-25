var Users = window.Users || {};

Users.authToken.then( token => {
  if (token) {
    function handleResponse(results){
      let current_Jobs = results.Items;
      current_Jobs.forEach( current_Job => {
        console.log(current_Job.end_time);
      });

    }
    let user = jwt_decode(token);
    let data = {operation: "getMaintenanceRecord", table: "Maintenance", target:user['cognito:username']};
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
    $.ajax(httpRequest);
  }
  else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});
