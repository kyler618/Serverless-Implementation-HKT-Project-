// var Users = window.Users || {};
let poolData;
(function ($) {
  if (typeof AWSCognito !== 'undefined') {
    AWSCognito.config.region = _config.cognito.region;
  }
  poolData = JSON.parse(localStorage.getItem("poolData"));
  if(poolData!==null){
    $.getScript( "js/cognito-auth.js", () => {
      if(Users){
        console.log(Users);
        Users.authToken.then((token) => {   // check user authority
          if (token) {
            window.location.href = 'main.html';
          } else {
            localStorage.removeItem('poolData');
            // window.location = "index.html";
          }
        });
      }
    });
  }
  else{
    $(function onDocReady() {
    $('#signinForm').submit(signin);
    function signin(){
      let email = $('#emailInputSignin').val();
      let password = $('#passwordInputSignin').val();
      let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: email,
          Password: password
      });
      switch(email.charAt(0)){
        case 'f':
          poolData = {
          UserPoolId: _config.cognito.fieldEng_userPoolId,
          ClientId: _config.cognito.fieldEng_userPoolClientId
        };
          break;
        case 's':
          poolData = {
          UserPoolId: _config.cognito.support_userPoolId,
          ClientId: _config.cognito.support_userPoolClientId
        };
          break;
        default:
          alert('Invaild Email account');
          return;
      }
      localStorage.setItem("poolData", JSON.stringify(poolData));
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
      let cognitoUser = new AmazonCognitoIdentity.CognitoUser({
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
  }
}(jQuery));
// Prepare for future use
// function handleChangePassword(event){
//   var oldPassword = $('#oldPasswordInputChangePassword').val();
//   var newPassword = $('#newPasswordInputChangePassword').val();
//   var newPassword2 = $('#newPassword2InputChangePassword').val();
//   event.preventDefault();
//   if (newPassword === newPassword2) {
//     var cognitoUser = userPool.getCurrentUser();
//     if(cognitoUser != null){
//       var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
//           Username: cognitoUser.getUsername,
//           Password: oldPassword
//       });
//       cognitoUser.authenticateUser(authenticationDetails, {
//           onSuccess: () => {
//             cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
//               if (err) {
//                 alert('Fail to change password');
//                 console.log(err);
//               }
//               else {
//                   alert('Password Successfully Changed');
//               }
//           })}
//       });
//     }
//     else {
//       alert("No Current User");
//     }
//   }
//   else {
//       alert('Passwords do not match');
//   }
// }
