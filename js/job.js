var Users = window.Users || {};

Users.authToken.then((token) => {   // check user authority
  if (token) {
    console.log('here');
  }
  else{
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  console.log(error);
  // siginout
});

// Users.authToken.then( token => {
//   if (token) {
//     function handleResponse(results){
//       console.log(results);
//     }
//     let user = jwt_decode(token);
//     var httpRequest = {
//       method: 'POST',
//       url: _config.api.invokeUrl +'/hkt-fieldeng-resource';,
//       headers: {Authorization: token},
//       contentType: 'application/json',
//       data : {operation: "getMaintenanceRecord", target:user['cognito:username']},
//       async: true ,
//       success: handleResponse,
//       error: (jqXHR, textStatus, errorThrown) => {
//         console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
//         console.error('Response: ', jqXHR.responseText);
//         alert('An error occured:\n' + jqXHR.responseText);
//       }
//     };
//   }
//   else {
//     // window.location.href = '/signin.html';
//   }
// }).catch((error) => {
//   // alert(error);
//   // window.location.href = '/signin.html';
// });
