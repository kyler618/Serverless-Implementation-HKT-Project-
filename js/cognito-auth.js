
var Users = window.Users || {};

(function scopeWrapper($) {
  var signinUrl = 'signin.html';
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
  Users.signOut = function signOut() {
      userPool.getCurrentUser().signOut();
  };

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

  // Users.group = new Promise(function (resolve, reject) {
  //     var cognitoUser = userPool.getCurrentUser();
  //     if (cognitoUser) {
  //         cognitoUser.getSession(function sessionCallback(err, session) {
  //             if (err) {
  //                 reject(err);
  //             } else if (!session.isValid()) {
  //                 resolve(null);
  //             } else {
  //                 let sessionInfo = jwt_decode(session.getIdToken().jwtToken);
  //                 let group = sessionInfo['cognito:groups'];
  //                 resolve(group);
  //             }
  //         });
  //     } else {
  //         resolve(null);
  //     }
  // });

  // Cognito User Pool functions

  function register(email, password, onSuccess, onFailure) {
      var dataEmail = {
          Name: 'email',
          Value: email
      };
      var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

      userPool.signUp(email, password, [attributeEmail], null,
          function signUpCallback(err, result) {
              if (!err) {
                  onSuccess(result);
              } else {
                  onFailure(err);
              }
          }
      );
  }
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
  function verify(email, code, onSuccess, onFailure) {
      createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
          if (!err) {
              onSuccess(result);
          } else {
              onFailure(err);
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

  // Determine groups
  function identifyGroup(){
    var cognitoUser = userPool.getCurrentUser();
    cognitoUser.getSession(function(err, session) {
      if (err) {
        return alert(err);
      }
      var sessionIdInfo = jwt_decode(session.getIdToken().jwtToken);
      var group = sessionIdInfo['cognito:groups'];
      console.log(group);
      return group;
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

  function handleSignin(event) {
      var email = $('#emailInputSignin').val();
      var password = $('#passwordInputSignin').val();
      event.preventDefault();
      signin(email, password,
          function signinSuccess() {
              console.log('Successfully Logged In');
              window.location.href = 'main.html';
          },
          function signinError(err) {
              alert(err);
          }
      );
  }
  function handleRegister(event) {
      var email = $('#emailInputRegister').val();
      var password = $('#passwordInputRegister').val();
      var password2 = $('#password2InputRegister').val();

      var onSuccess = function registerSuccess(result) {
          var cognitoUser = result.user;
          console.log('user name is ' + cognitoUser.getUsername());
          var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
          if (confirmation) {
              window.location.href = 'verify.html';
          }
      };
      var onFailure = function registerFailure(err) {
          alert(err);
      };
      event.preventDefault();

      if (password === password2) {
          register(email, password, onSuccess, onFailure);
      } else {
          alert('Passwords do not match');
      }
  }
  function handleVerify(event) {
      var email = $('#emailInputVerify').val();
      var code = $('#codeInputVerify').val();
      event.preventDefault();
      verify(email, code,
          function verifySuccess(result) {
              console.log('call result: ' + result);
              console.log('Successfully verified');
              alert('Verification successful. You will now be redirected to the login page.');
              window.location.href = signinUrl;
          },
          function verifyError(err) {
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
  function handleForgetPassword(event) {
    event.preventDefault();
    var email = prompt('Please input your email ' ,'');
    var cognitoUser = createCognitoUser(email);

    cognitoUser.forgotPassword({
          onSuccess: function (result) {
              console.log('call result: ' + result);
          },
          onFailure: function(err) {
              alert(err);
          },
          inputVerificationCode() {
              var verificationCode = prompt('Please input verification code ' ,'');
              var newPassword = bootbox.prompt('Enter new password ' ,'');
              cognitoUser.confirmPassword(verificationCode, newPassword, this);
          }
      });

    }
}(jQuery));
