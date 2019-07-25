var Users = window.Users || {};
Users.authToken.then((token) => {   // check user authority
  if (token) {
    // httpRequest.headers = {Authorization: token};
    let x = jwt_decode(token);
    console.log(x['cognito:username']);
  } else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});
