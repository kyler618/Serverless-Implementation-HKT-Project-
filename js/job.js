var Users = window.Users || {};
Users.authToken.then((token) => {   // check user authority
  console.log('here2', token);
  if (token) {
    httpRequest.headers = {Authorization: token};
    let x = jwt_decode(token);
    console.log('yes');
  } else {
    console.log('not here');
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});
