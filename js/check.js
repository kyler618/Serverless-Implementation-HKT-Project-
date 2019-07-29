var Users = window.Users || {};
Users.authToken.then( token => {   // check user authority
  if (!token) {
    Users.signOut();
  }
}).catch((error) => {
  console.log(error);
  window.location.href = 'index.html';
});
