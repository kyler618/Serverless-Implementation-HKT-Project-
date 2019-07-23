
var Users = window.Users || {};

(function scopeWrapper($) {
  var signinUrl = 'index.html';
  var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId
  };
  var userPool;
  if (!(_config.cognito.userPoolId &&
        _config.cognito.userPoolClientId &&
        _config.cognito.region)) {
      $('#noCognitoMessage').show();
      return;
  }
  userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  if (typeof AWSCognito !== 'undefined') {
      AWSCognito.config.region = _config.cognito.region;
  }

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

  function signin(email, password, onSuccess, onFailure) {
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: email,
          Password: password
      });
      var cognitoUser = createCognitoUser(email);
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: onSuccess,
          onFailure: onFailure,
          newPasswordRequired: function(userAttributes, requiredAttributes) {
            cognitoUser.completeNewPasswordChallenge(password, {}, this)
          }
      });
  }
  function changePassword(oldPassword, newPassword, onSuccess, onFailure) {
      var cognitoUser = userPool.getCurrentUser();
      if(cognitoUser != null){
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: cognitoUser.getUsername,
            Password: oldPassword
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (){
            cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
              if (err) {
                  onFailure(err);
              } else {
                  onSuccess(result);
                }
              })}
        });
      }
      else {
        alert("No Current User");
      }
  }
  function createCognitoUser(email) {
      return new AmazonCognitoIdentity.CognitoUser({
          Username: email,
          Pool: userPool
      });
  }

  // Event Handlers

  $(function onDocReady() {
      $('#signinForm').submit(handleSignin);
      $('#registrationForm').submit(handleRegister);
      $('#verifyForm').submit(handleVerify);
      $('#changePassword').submit(handleChangePassword);
      $('#forgetPassword').submit(handleForgetPassword);
  });

  function handleSignin() {
      var email = $('#emailInputSignin').val();
      var password = $('#passwordInputSignin').val();
      // event.preventDefault();
      signin(email, password,
          () => {
            window.location.href = 'main.html';
          },
          function signinError(err) {
              alert(err);
          }
      );
  }
  function handleChangePassword(event) {
      var oldPassword = $('#oldPasswordInputChangePassword').val();
      var newPassword = $('#newPasswordInputChangePassword').val();
      var newPassword2 = $('#newPassword2InputChangePassword').val();
      event.preventDefault();
      if (newPassword === newPassword2) {
          changePassword(oldPassword, newPassword, function changePasswordSuccess(result){
            console.log('call result: ' + result);
            console.log('Password successfully changed');
            alert('Changing Password successful. You will now be redirected to the Main page.');
          },
            function changePasswordError(err){
              alert(err);
          }
        );
      } else {
          alert('Passwords do not match');
      }
  }
}(jQuery));
