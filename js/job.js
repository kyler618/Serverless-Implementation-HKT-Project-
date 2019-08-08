Users.authToken.then( token => {
  if (token) {
    function handleResponse(results){
      function createCard(id, header, content){
        return getHtml([
          '<div class="card col-sm-3" onclick="card.card_Show(\'' + id + '\')">',
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
      current_Jobs = results.Items;
      records = results.records;
      let count = 0;
      let $jobs = current_Jobs.map( current_Job => {
        if(current_Job.end_time === undefined){
          let $cardHeader = createCardHeader(current_Job.sensor_ID);
          let $cardContent = createCardContent(current_Job.inventory_ID, current_Job.start_time);
          return createCard(current_Job.inventory_ID, $cardHeader, $cardContent);
        }
      }).filter( current_Job => current_Job );
      let jobsTemp = [];
      $jobs = $jobs.map( (job, index) => {
        jobsTemp.push(job);
        if((++count%3==0 || index == ($jobs.length-1)) && jobsTemp.length != 0){
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
    data_getRecord = {operation: "getMaintenanceRecord", table: "Maintenance", target:user['cognito:username']};
    success_getRecord = handleResponse;
    httpRequest = {
      method: 'POST',
      url: _config.api.invokeUrl +'/field-engineer',
      headers: {Authorization: token},
      contentType: 'application/json',
      data : JSON.stringify(data_getRecord),
      async: true,
      success: success_getRecord,
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
    window.location.href = '/signin.html';
  }
}).catch((error) => {
  window.location.href = '/signin.html';
});

function card(){
  function initialize(){
    card.card_Show = card_Show;
  }
  function card_Show(id){
    function edit(){
      card.remove_Input = remove_Input;
      $('#card .edit').show();
      $('#undo').click( () => {
        $('#card .edit').unbind().hide();
        $('#edit').show().click(edit);
        $('#complete').show().click(complete);
        $('#card input').attr('readonly', true);
        $('#card .temporary').remove();
        createForm();
        card.remove_Input = null;
      });
      $('#add').click( () => {
        $('#form').append(getHtml([
          '<p class="temporary">',
          '<input type="text" class="input-group-text">',
          '<input type="text" class="form-control">',
          '<button class="edit" onclick="card.remove_Input(this)" style="display:inline"><i class="fa fa-close"></i></button>',
          '</p>'
        ]));
        $('.temporary button.edit').show();
      });
      $('#save').click( () => {
        function handleResponse(results){
          if(results=="ok"){
            let index = records.indexOf(item);
            items.id = id;
            item = items;
            records[index] = items;
            $('#card .temporary').removeClass('temporary');
            $('#undo').click();
            httpRequest.data = JSON.stringify(data_getRecord);
            httpRequest.success = success_getRecord;
            $.ajax(httpRequest);
          }
        }
        const items = {};
        const attributes = [];
        const input = $('#card input');
        let changed = false;
        for( let x = 0 ; x < input.length ; x++ ){
          const attribute = input[x++];
          const record = input[x];
          if(attribute.value==""||record.value==""){
            // items.incompleteError = x-1;
            alert("Incompleted Error");
            break;
          }
          if(attributes.includes(attribute.value)){
            // items.DuplicateError = x-1;
            alert("Duplicate Error");
            break;
          }
          attributes.push(attribute.value);
          items[attribute.value] = record.value;
          if(!changed){
            if(item[attribute.value]===undefined){
              changed = true;
            }
            if(items[attribute.value]!=item[attribute.value]){
              changed = true;
            }
          }
        }
        let deleteItem = Object.keys(item).filter( attribute => {
          if( attribute!="id" && !(attributes.includes(attribute)) ){
            return attribute;
          }
        });
        if( !changed && deleteItem.length==0){
          return $('#undo').click();
        }
        let check = storedItem.every( item => {
          return item[constantAttributes[0]] != items[constantAttributes[0]];
        });
        if(!check){
          alert("Sensor ID Duplicates with Existing Items");
          return;
        }
        const data = {table:"Hardware", operation: "maintainSensor", pk: id};
        data.input = (changed)? items:null;
        data.delete = (deleteItem.length!=0)? deleteItem:null;
        httpRequest.data = JSON.stringify(data);
        httpRequest.success = handleResponse;
        $.ajax(httpRequest);
      });
      $('#card .form-control').removeAttr('readonly');
      $('#card .input-group-text:not(.readonly)').removeAttr('readonly');
      $('#edit').unbind().hide();
      $('#complete').unbind().hide();
    }
    function createForm(){
      function createInput(attribute, record){
        return getHtml([
          '<p class="addition">',
          '<input type="text" class="input-group-text" value=\'' + attribute + '\' readonly>',
          '<input type="text" class="form-control" name=\'' + attribute + '\' value=\'' + record + '\' readonly>',
          '<button class="edit" onclick="card.remove_Input(this)"><i class="fa fa-close"></i></button>',
          '</p>'
        ]);
      }
      for(let key in item){
        if(key=="id") continue;
        let $input = $('#card input.form-control[name=\'' + key + '\']');
        if($input.length != 0 ){
          $('#card input.input-group-text[value=\'' + key + '\']').val(key); // for undo
          $input.val(item[key]);
        }
        else{
          $('#form').append(createInput(key, item[key]));
        }
      }
    }
    function complete(){
      function handleResponse(results){
        if(results=="ok"){
          httpRequest.data = JSON.stringify(data_getRecord);
          httpRequest.success = function(results){
            success_getRecord(results);
            $('#quit').click();
          }
          $.ajax(httpRequest);
        }
      }
      let target = current_Jobs.find(current_Job => {
        return current_Job.inventory_ID == id;
      });
      data_confirm = {operation: "completeMaintenance", table: "Maintenance", target:target.id};
      httpRequest.data = JSON.stringify(data_confirm);
      httpRequest.success = handleResponse;
      $.ajax(httpRequest);
    };
    function remove_Input(button){
      $(button).parent().remove();
    }
    let item = records.find(record => {
      return record.id == id
    });
    $('#card').show();
    $('#edit').click(edit);
    $('#complete').click(complete);
    $('#quit').click( () => {
      $('#edit').unbind().show();
      $('#complete').unbind().show();
      $('#card .edit').unbind().hide();
      $('#card').hide();
      $('.addition').remove();
      $('.temporary').remove();
      $('#card .form-control').val('');
      card.remove_Input = null;
      $('#quit').unbind();
    });
    createForm();
  }
  initialize();
}

function getHtml(template) {
  return template.join('\n');
}
