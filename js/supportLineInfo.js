var Users = window.Users || {};
if (!_config.api.invokeUrl) {
  $('#noApiMessage').show();
}

Users.authToken.then((token) => {
  if (token) {
    authToken = token;
    let httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl + '/support',
      data: JSON.stringify({table: "Support_Line_Information", operation: "scan"}),
      contentType: 'application/json',
      headers: {Authorization: authToken},
      async: true,
      success: list,
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured:\n' + jqXHR.responseText);
      }
    };
    $.ajax(httpRequest);
  } else {
    window.location.href = '/signin.html';
  }
}).catch((error) => {
    window.location.href = '/signin.html';
  });

function list(results){
  console.log(results.Items);
  let content = (results.Items).map(result => {
    return getHtml([
      '<div>',
        '<h1>',
          result['Contact No.'],
        '</h1>',
        '<h2>',
          result['Email Address'],
        '</h2>',
        '<h2>',
          result['Product'],
        '</h2>',
      '</div>',
    ]);

    // const option = document.createElement('option');
    // option.appendChild( document.createTextNode(result['Billed Customer Name']) );
    // option.value = result['Tenant ID Number'];
    // $('#selector select').append(option);
  });
  $('#content').html(getHtml(content));
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
