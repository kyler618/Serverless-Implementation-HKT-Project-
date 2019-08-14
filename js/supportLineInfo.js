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
      success: results => {
        function getHtml(template) {
          return template.join('\n');
        }
        let content = (results.Items).map(result => {
          return getHtml([
            '<div>',
              '<h1>',
                result['Product'],
              '</h1>',
              '<h2>',
                'Contact No. : ',
                result['Contact No.'],
              '</h2>',
              '<h2>',
                'Email Address : ',
                result['Email Address'],
              '</h2>',
            '</div>',
          ]);
        });
        $('#content').html(getHtml(content));
      },
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
