var Users = window.Users || {};

Users.authToken.then( token => {
  if (token) {
    function handleResponse(results){
      function createCardHeader(header){
        return getHtml([
          '<div class="card-header pb-0">',
            '<div class="card-title-wrap bar-primary">',
              '<div class="card-title">' + + '</div>',
            '</div>',
          '</div>'
        ]);
      }
      let current_Jobs = results.Items;
      let count = 0;
      let $row;
      current_Jobs.forEach( current_Job => {
        if(current_Job.end_time === undefined){
          if(count++%4==0){
            $row = document.createElement("div");
          }
          let $card = document.createElement("div");
          // let $cardHeader = createCardHeader();
          // $row.appendChild();
        }
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

function getHtml(template) {
  return template.join('\n');
}
