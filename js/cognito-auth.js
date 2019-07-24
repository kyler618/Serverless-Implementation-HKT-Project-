
var Users = window.Users || {};

if (!(_config.cognito.userPoolId && _config.cognito.userPoolClientId && _config.cognito.region)) {
  alert('No Cognito Configuration');
}
if (typeof AWSCognito !== 'undefined') {
  AWSCognito.config.region = _config.cognito.region;
}

(function ($) {
  var poolData = JSON.parse(localStorage.getItem("poolData"));
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  Users.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
      var cognitoUser = userPool.getCurrentUser();
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
    };

}(jQuery));
