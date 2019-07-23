$(function onDocReady() {
  $('#signinForm').submit(signin);
  function signin(event){
    event.preventDefault();
      var email = $('#emailInputSignin').val();
      var password = $('#passwordInputSignin').val();
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: email,
          Password: password
      });
      var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
          Username: email,
          Pool: User.userPool
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
