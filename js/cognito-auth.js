var Users = window.Users || {};

if (typeof AWSCognito !== 'undefined') {
  AWSCognito.config.region = _config.cognito.region;
}

(function ($) {
  try{
    let poolData = JSON.parse(localStorage.getItem("poolData"));
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    Users.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
      cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.getSession(function sessionCallback(err, session) {
          if (err) {
            reject(err);
          } else if (!session.isValid()) {
            resolve(null);
          } else {
            resolve(session.getIdToken().getJwtToken());
          }
        });
      } else {
        resolve(null);
      }
    });
    Users.signOut = function signOut() {
      userPool.getCurrentUser().signOut();
      // cognitoUser.globalSignOut(  {   onFailure: e =>   console.log(e)
        //                            , onSuccess: r =>   console.log('Logout success' + r)  })
        localStorage.removeItem('poolData');
        alert("You have been signed out.");
        window.location = "index.html";
      };
    Users.authToken.then( token => {   // check user authority
      if (!token) {
        Users.signOut();
      }
    });
  }
  catch(error){
    // window.location.href = 'index.html';
  }
}(jQuery));
