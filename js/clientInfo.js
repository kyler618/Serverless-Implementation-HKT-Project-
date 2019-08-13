var Users = window.Users || {};
var info;
if (!_config.api.invokeUrl) {
  $('#noApiMessage').show();
}

Users.authToken.then((token) => {
  if (token) {
    authToken = token;
    let identityCode = jwt_decode(token).iss.replace('https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_', '');
    let httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl1,
      data:JSON.stringify({username: "abc2"}),
      // data: JSON.stringify({table: "Client_Information", operation: "clientInfoQuery"}),
      contentType: 'application/json',
      // headers: {Authorization: authToken},
      async: true ,
      // success: list_EndUser_Name,
      success: (result) => { console.log(result) },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured:\n' + jqXHR.responseText);
      }
    };
    switch(identityCode){
      case 'DevfD3lWf':
      // httpRequest.url += '/support';
      httpRequest.url += '/test';
      break;
      case 'p7IxZwAdF':
      httpRequest.url += '/field-engineer';
      break;
    }
    console.log(httpRequest);
    $.ajax(httpRequest);
  } else {
    window.location.href = '/signin.html';
  }
}).catch((error) => {
    window.location.href = '/signin.html';
  });

function list_EndUser_Name(results){
  info = results.Items;
  (results.endUser.Items).forEach(result => {
    const option = document.createElement('option');
    option.appendChild( document.createTextNode(result['Billed Customer Name']) );
    option.value = result['Tenant ID Number'];
    $('#selector select').append(option);
  });
}

function select_EndUser_Change(event){
  let content = $("#content");
  content.empty();
  info.map(item=>{
    if(item['Tenant ID Number']==event.target.value){
       let div = $("<div></div>");
       let title = $("<h1></h1>").text(item.Name);
       let account = $("<h2></h2>").text("Account : " + item.Account);
       let password = $("<h2></h2>").text("Password : " + item.Password);
       div.append(title, account, password);
       content.append(div, $("<p>"));
    }
  });
}

function getHtml(template) {
  return template.join('\n');
}
