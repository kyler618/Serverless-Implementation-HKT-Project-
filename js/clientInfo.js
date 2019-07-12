var Users = window.Users || {};
var info;
if (!_config.api.invokeUrl) {
  $('#noApiMessage').show();
}

Users.authToken.then((token) => {
  if (token) {
    authToken = token;
    let httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl + '/hkt-resource',
      data: JSON.stringify({table: "Client_Information", operation: "clientInfoQuery"}),
      contentType: 'application/json',
      headers: {Authorization: authToken},
      async: true ,
      success: list_EndUser_Name,
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured:\n' + jqXHR.responseText);
      }
    };
    $.ajax(httpRequest);
  } else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});

function list_EndUser_Name(results){
  info = results.Items;
  (results.endUser.Items).forEach(result => {
    const option = document.createElement('option');
    option.appendChild( document.createTextNode(result.Billed_customer_name) );
    option.value = result.Tenant_ID_number;
    $('#selector select').append(option);
  });
}

function select_EndUser_Change(event){
  let content = $("#content");
  content.empty();
  info.map(item=>{
    if(item.Tenant_ID_number==event.target.value){
       let div = $("<div></div>");
       let title = $("<h1></h1>").text(item.Name);
       let account = $("<h2></h2>").text("Account : " + item.Account);
       let password = $("<h2></h2>").text("Password : " + item.Password);
       div.append(title, account, password);
       content.append(div, $("<p>"));
    }
  });
}
