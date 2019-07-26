var Users = window.Users || {};
console.log('version 2');
Users.authToken.then( token => {
  if (token) {
    function handleResponse(results){
      function createCardHeader(id){
        return getHtml([
          '<div class="card-header pb-0">',
            '<div class="card-title-wrap bar-primary">',
              '<div class="card-title">' + id + '</div>',
            '</div>',
          '</div>'
        ]);
      }
      function createCardContent(id, start_time){
        let record = results.records.find(item => item.id == id);
        console.log(record);
        return getHtml([
          '<div class="card-content">',
            '<div class="card-body">',
              record.Enduser_name,
              record.Physical_Site_Address,
              record.Device_Type,
              start_time,
            '</div>',
          '</div>'
        ]);
      }
      let current_Jobs = results.Items;
      let count = 0;
      let $row;
      // console.log(results);
      let $jobs = current_Jobs.map( current_Job => {
        if(current_Job.end_time === undefined){
          // console.log(current_Job);
          if(count++%4==0){
            $row = document.createElement("div");
          }
          let $card = document.createElement("div");
          $card.classList.add('card','col-sm-3');
          let $cardHeader = createCardHeader(current_Job.sensor_ID);
          let $cardContent = createCardContent(current_Job.inventory_ID, current_Job.start_time);
          $card.innerHTML = getHtml([
            $cardHeader,
            $cardContent,
          ]);
          return $card;
          // $card.appendChild(createCardHeader(current_Job.sensor_ID));
          // $row.appendChild();
        }
      });
      console.log(getHtml($jobs));
      $('#container').html(getHtml($jobs));
    }
    let user = jwt_decode(token);
    let data = {operation: "getMaintenanceRecord", table: "Maintenance", target:user['cognito:username']};
    var httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl +'/hkt-fieldeng-resource',
      headers: {Authorization: token},
      contentType: 'application/json',
      data : JSON.stringify(data),
      async: true,
      success: handleResponse,
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured:\n' + jqXHR.responseText);
      }
    };
    $.ajax(httpRequest);
  }
  else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});

function getHtml(template) {
  return template.join('\n');
}
