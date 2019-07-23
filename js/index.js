
$(function onDocReady() {
  $('#signinForm').submit(signin);
  function signin(event){
      console.log('signin');
      event.preventDefault();
      var email = $('#emailInputSignin').val();
      var password = $('#passwordInputSignin').val();
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: email,
          Password: password
      });
      var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
          Username: email,
          Pool: userPool
      });
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function(){
            window.location.href = 'main.html';
          },
          onFailure: function(err){
            alert('Login Failed');
            console.log(err);
          },
          newPasswordRequired: function(userAttributes, requiredAttributes) {
            cognitoUser.completeNewPasswordChallenge(password, {}, this)
          }
      });
    }
});
