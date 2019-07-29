var Users = window.Users || {};
console.log('version 3');

Users.authToken.then( token => {
  if (token) {
    function handleResponse(results){
      function createCard(id, header, content){
        return getHtml([
          '<div id="' + id + '" class="card col-sm-3" onclick="card.card_Show(this)">',
            header,
            content,
          '</div>'
        ]);
      }
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
        return getHtml([
          '<div class="card-content">',
            '<div class="card-body">',
              record.Enduser_name,
              '<br>',
              record.Physical_Site_Address,
              '<p>',
              record.Device_Type,
              '</p>',
              '<span class="w3-right">',
              start_time,
              '</span>',
            '</div>',
          '</div>'
        ]);
      }
      let current_Jobs = results.Items;
      records = results.records;
      let count = 0;
      let $jobs = current_Jobs.map( current_Job => {
        if(current_Job.end_time === undefined){
          let $cardHeader = createCardHeader(current_Job.sensor_ID);
          let $cardContent = createCardContent(current_Job.inventory_ID, current_Job.start_time);
          return createCard(current_Job.inventory_ID, $cardHeader, $cardContent);
        }
      });
      let jobsTemp = [];
      $jobs = $jobs.map( (job, index) => {
        jobsTemp.push(job);
        if((++count%3==0 || index == $jobs.length - 1) && jobsTemp.length != 0){
          let template = getHtml([
            '<div class="row">',
            jobsTemp,
            '</div>'
          ]);
          jobsTemp.length = 0;
          return template;
        }
      });
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
    card();
  }
  else {
    // window.location.href = '/signin.html';
  }
}).catch((error) => {
  // alert(error);
  // window.location.href = '/signin.html';
});

function card(){
  function initialize(){
    card.card_Show = card_Show;
  }
  function card_Show(event){
    console.log(event);
    function undo(){
      $('#card .edit').show();
      $('#undo').click( () => {
        $('#card .edit').unbind().hide();
        $('#edit').show().click(undo);
      });
      $('#edit').unbind().hide();
    }
    $('#card').show();
    $('#edit').click(undo);
    $('#quit').click( () => {
      $('#edit').show();
      $('#card .edit').unbind().hide();
      $('#card').hide();
      $('#quit').unbind();
    });
  }
  initialize();
}

function getHtml(template) {
  return template.join('\n');
}
