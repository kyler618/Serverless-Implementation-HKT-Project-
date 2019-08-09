// add reset search bar
var Users = window.Users || {};

  user_Identity();
  selector = [];
  attributes = [];
  selectFields = [];
  // constantAttributes = [];
  _searchItem = null;
  httpRequest = {
    method: 'POST',
    url: _config.api.invokeUrl,
    contentType: 'application/json',
    async: true ,
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
      console.error('Response: ', jqXHR.responseText);
      alert('An error occured:\n' + jqXHR.responseText);
    }
  };

  targetTable = $('#current').html();
  switch(targetTable){
    case "Customer and Software":
      targetTable = "Customer_and_Software";
      constantAttributes = [
        'Tenant ID Number',
        'Billed Customer Name',
        'Billed Customer Contact',
        'Enduser Address for Reference'
      ]
      // constantAttributes.push('Tenant ID Number');
      // selectFields.push(
      //   'Billed Customer Name',
      //   'Billed Customer Contact',
      //   'Enduser Address for Reference'
      // );
      break;
    case "Hardware":
      constantAttributes = ['Sensor ID'];
      // constantAttributes.push('Sensor ID');
      selectFields.push('Enduser Name', 'Physical Site Address', 'Device Type');
      constantAttributes = constantAttributes.concat(selectFields);
      $('#selector').show();
      break;
  }

  // on start

  $( document ).ready(function() {
    initialize();
    pagination();
  });

  // basic functions

  function user_Identity(){
    let region = _config.cognito.region;
    let key = 'cognito-idp.' + region + '.amazonaws.com/';
    let logins = {};
    let userPool;
    let params = {
      AttributesToGet: [],
      Filter: "",
      UserPoolId: _config.cognito.fieldEng_userPoolId
    };
    let x = 1;
    AWS.config.region = region;
    AWS.config.correctClockSkew = true;
    function authorize(){
      Users.authToken.then((token) => {   // check user authority
        if (token) {
          let identityCode = jwt_decode(token).iss.replace('https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_', '');
          switch(identityCode){
            case 'DevfD3lWf':
            httpRequest.url += '/support';
            key +=  _config.cognito.support_userPoolId;
            break;
            case 'p7IxZwAdF':
            httpRequest.url += '/field-engineer';
            key +=  _config.cognito.fieldEng_userPoolId;
            break;
          }
          httpRequest.headers = {Authorization: token};
          logins[key] = token;
        }
        else {
          Users.signOut();
        }
      }).catch((error) => {
        window.location.href = 'index.html';
      });
    }
    function initialize(){
      user_Identity.listUsers = listUsers;
      authorize();
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: _config.cognito.identityPoolId,
        Logins: logins
      });
      userPool = new AWS.CognitoIdentityServiceProvider();
    }
    function listUsers(id, oldRecord){
      userPool.listUsers(params, (err, data) => {
        if (err) return console.log(err);
        function show_Maintain_Cancel_Button(id){
          $('#maintain-select').prop('disabled', 'disabled');
          $('#maintain-cancel').show().click( () => {
            function handleResponse(results){
              $('#maintain-cancel').unbind().hide();
              $('#maintain-select').prop('disabled', false);
              default_Option.selected = true;
              alert('Maintenance Request Canceled');
            }
            const data = {operation: "cancelMaintainRequest", target: id};
            request(data, handleResponse, 'Maintenance');
          });
        }
        let target = storedItem.find( item => {
          return item.id == id ;
        });
        $('#maintain-sensorID').html(target[constantAttributes[0]]);
        let users = (data.Users).map(user=>user.Username);

        $('#form').hide();
        $('#edit').hide().unbind();
        $('.maintain').hide().unbind();
        $('#maintain-Container').show();
        $('#undo').show().click( () => {
          $('#form').show();
          $('#edit').show().click(modal.edit);
          $('.maintain').show().click(modal.maintain);
          $('#quit').unbind();
          $('#quit').click(modal.quit);
          $('#maintain-Container').hide();
          $('#maintain-confirm').unbind().hide();
          $('#maintain-sensorID').html("");
          $('#maintain-select').unbind().empty();
          $('#maintain-cancel').unbind().hide();
          $('#undo').unbind().hide();
          modal.edit = null;
          modal.maintain = null;
          modal.quit = null;
        });
        $('#quit').unbind();
        $('#quit').click( () => {
          modal.show_Modal = null;
          modal.edit = null;
          modal.maintain = null;
          modal.quit = null;
          $('#form').show().empty();
          $('#edit').show();
          $('.maintain').show();
          $('#undo').unbind().hide();
          $('#maintain-Container').hide();
          $('#maintain-confirm').unbind().hide();
          $('#maintain-cancel').unbind().hide();
          $('#maintain-select').unbind().empty();
          $('#maintain-sensorID').html("");
          $('#quit').unbind();
          $('#modal').hide();
        });

        const default_Option = document.createElement('option');
        default_Option.appendChild( document.createTextNode(' -- Select Field Engineer -- ') );
        default_Option.disabled = true;
        default_Option.selected = true;
        $('#maintain-select').prop('disabled', false).append(default_Option);
        $('#maintain-select').change( event => {
          if(event.target.value != null){
            $('#maintain-confirm').show();
          }
        });

        $('#maintain-confirm').click( () => {
          function handleResponse(results){
            show_Maintain_Cancel_Button(results);
            $('#maintain-confirm').hide();
            alert('Request Confirm');
          }
          const inputs = {};
          inputs.inventory_ID = id;
          inputs.sensor_ID = $('#maintain-sensorID').html();
          inputs.field_Engineer = $('#maintain-select').val();
          const data = {operation: "maintainRequest", input: inputs};
          request(data, handleResponse, 'Maintenance');
        });

        users.forEach(user => {
          const option = document.createElement('option');
          option.appendChild( document.createTextNode(user) );
          option.value = user;
          $('#maintain-select').append(option);
          if(oldRecord!==undefined && user==oldRecord.field_Engineer){
            option.selected = true;
            show_Maintain_Cancel_Button(oldRecord.id);
          }
        });

      });
    }
    initialize();
  }

  function initialize(){
    function selectorChange(event, x){
      if(x<=1){
        if(x==0){
          clearOption(2);
          $(selector[2].bar).prop('disabled', 'disabled').unbind();
        }
        clearOption(3);
      }
      if( event.target.selectedIndex == 0 ){
        // 'all' selected
        if(x==0||x==1){
          // $(selector[x+1].bar).children().first().html('');
          $(selector[x+1].bar).prop('disabled', 'disabled').unbind();
        }
        delete selector[x].searchKey;
      }
      else{
        if(x<=1){
          $(selector[x+1].bar).children().first().html('All');
          $(selector[x+1].bar).prop('disabled', false).change( event => {selectorChange(event, x+1)});
        }
        selector[x].searchKey = $(selector[x].bar).val();
      }
      searchItem();
    }
    $("#itemForm").bind("keypress", event => {
      if(event.keyCode === 13)
      {
        event.preventDefault();
      }
    });
    const input = document.getElementById('searchBar');
    input.addEventListener("keyup", function(event) {
      event.preventDefault();
      _searchItem = ($(this).val() != "")? $(this).val():null;
      searchItem();
    });

    $("#showAll").change( () => {
      ( $("#showAll").prop("checked") )?showColumn():hideColumn();
    });
    if(targetTable == 'Hardware'){
      const selectBar = $('#selector div select');
      const selectBarText = $('#selector div span');
      for(let x=0;x<selectBar.length;x++){
        let name = selectFields[x].replace(/\_+/g, ' ');
        $(selectBarText[x]).html(name+" :");
        selector.push({field:selectFields[x], bar:selectBar[x]});
      }
      $(selector[0].bar).change( event => {selectorChange(event, 0)});
    }
    $('#pagerSize').change(function(){
      pagination.case_changeSize(this.value);
    })

    handleUpdateTable();
    readMode();
  }

  function readMode(){
    $('.readMode').show();
    $('.editMode').hide();

    $("#table tbody input").attr('readOnly', true).unbind();
    $('#addItem').click( () => {
      function createRemoveButton(){
        return getHtml([
          '<button onclick="modal.remove(this)">',
          '<i class="fa fa-close"></i>',
          '</button>'
        ]);
      }
      modal.remove = button => {
          return $(button).parent().remove();
        };
      $('#modal').show();
      $('#add').show().click( () => {
        const p = document.createElement("P");
        const field = createFormInput( null, null, false);
        const value = createFormInput( null, null, false);
        field.classList.add('input-group-text');
        value.classList.add('form-control');
        $(p).html(getHtml([
          field.outerHTML,
          value.outerHTML,
          createRemoveButton()
        ]));
        $('#form').append(p);
      });
      $('#save').show().click( event => {
        function handleResponse(results){
          if(results.status=="ok"){
            handleScanResponse(results);
            $('#quit').click();
            alert("Put Item Successed.");
          }
          else {
            alert("Put Item Failed.");
          }
        }
        const items = {};
        const attributes = [];
        const input = $('#modal input');
        for( let x = 0 ; x < input.length ; x++ ){
          const attribute = input[x++];
          const record = input[x];
          if(attribute.value==""||record.value==""){
            // items.incompleteError = x-1;
            alert("Incompleted Error");
            return;
          }
          if(attributes.includes(attribute.value)){
            // items.DuplicateError = x-1;
            alert("Duplicate Error");
            return;
          }
          attributes.push(attribute.value);
          items[attribute.value] = record.value;
        }
        let check = storedItem.every( item => {
          return item[constantAttributes[0]] != items[constantAttributes[0]];
        });
        if(!check){
          alert("Sensor ID Duplicates with Existing Items");
          return;
        }
        const data = {operation: "put", input: items};
        request(data, handleResponse);
      });
      $('#quit').click( () => {
        delete modal.remove;
        $('#form').empty();
        $('#modal').hide();
        $('#add').hide().unbind();
        $('#save').hide().unbind();
        $('#edit').show();
        $('#quit').unbind();
      });
      const form = constantAttributes.map( constantAttribute => {
        let item = [];
        let field = createFormInput( null, constantAttribute, true);
        let value = createFormInput( constantAttribute, null, false);
        field.classList.add('input-group-text');
        value.classList.add('form-control');
        item.push(field.outerHTML, value.outerHTML);
        if(constantAttribute != constantAttributes[0]){
          item.push(createRemoveButton());
        }
        return getHtml([
          "<p>",
          getHtml(item),
          "</p>"
        ]);
      });
      $('#form').html(form);
    } );
    $('#editTable').click( () => {
      const changedRecords = [];
      $('.readMode').hide().unbind();
      $('.editMode').show().unbind();

      $("#table tbody input").removeAttr("readOnly").change( event => {
        const id = $(event.target).parent().parent().prop('id');
        if(!changedRecords.includes(id)){
          changedRecords.push(id);
        }
      });

      $('#confirmUpdate').click( () => {
        function handleMultipleUpdateResponse(results){
          if(results.status=="ok"){
            handleScanResponse(results);
            alert("Update Items Successed.");
            readMode();
          }
          else {
            alert("Update Items Failed.");
          }
        }
        if(changedRecords.length==0){
          return readMode();
        }
        const updateRecords = [];
        changedRecords.forEach( changedRecord => {
          let changed = false;
          const items = {};
          const item = storedItem.find( item => item.id == changedRecord);
          const records = $('#table tbody tr[id=\'' + changedRecord + '\'] input');
          Array.from(records).forEach( record => {
            if(record.value == ""){
              alert("Incompleted Error.");
              return;
            }
            if(record.value != item[record.name]){
              changed = true;
            }
            items[record.name] = record.value;
          });
          if(changed){
            items[attributes[0]] = changedRecord;
            updateRecords.push(items);
          }
        });
        const data = {operation:'multipleUpdate'};
        data.input = (updateRecords.length!=0)? updateRecords:null;
        return (data.input!=null)? request(data, handleMultipleUpdateResponse):readMode();

      });
      $('#table tbody').unbind().click( event => {
        const cell = event.target;
        if(cell.innerHTML=="" && cell.tagName == "TD"){
          const field = cell.headers;
          const id = $(cell).parent().prop('id');
          if(!changedRecords.includes(id)){
            changedRecords.push(id);
          }
          $(cell).append(createFormInput(field, "", false));
        }
      });
      $('#cancelEdit').click( () => {
        $('#cancelEdit').unbind();
        $('#table tbody').unbind();
        changedRecords.forEach( changedRecord => {
          const records = $('#table tbody tr[id=\'' + changedRecord + '\'] input');
          const item = storedItem.find( item => item.id == changedRecord);
          const attrs = Object.keys(item);
          Array.from(records).forEach( record => {
            const attr = $(record).attr('name');
            if(attrs.includes(attr)){
              $(record).val(item[attr]);
            }
            else{
              $(record).remove();
            }
          });
        })
        if(changedRecords.length!=0){
          for(let x=0; x<changedRecords.length; x++){
            const pkey = changedRecords[x];
            const index = storedItem.map(x=>x[attributes[0]]).indexOf(pkey);
            const attrs = Object.keys(storedItem[index]);
            const record = Array.from($("input." + pkey));
            for(let y=0; y<record.length; y++){
              const field = record[y].classList[0];
              const cell = "input." + field + "." + pkey;
              if(attrs.includes(field)){
                $(cell)[0].value = storedItem[index][field];
              }
              else{
                $(cell)[0].remove();
              }
            }
          }
        }
        readMode();
      });
    } );
    $('#table tbody').click(modal);
    $('#updateTable').click(handleUpdateTable);
  }

  function hideColumn(){
    attributes.forEach( attribute => {
      if(!constantAttributes.includes(attribute)){
        $('#table thead th[id=\'' + attribute + '\']').hide();
        $('#table tbody td[headers=\'' + attribute + '\']').hide();
      }
    });
  }

  function showColumn(){
    attributes.forEach( attribute => {
      if(!constantAttributes.includes(attribute)){
        $('#table thead th[id=\'' + attribute + '\']').show();
        $('#table tbody td[headers=\'' + attribute + '\']').show();
      }
    });
    if(_searchItem!==null){
      if(targetTable =='Hardware' && selector[0].searchKey===undefined){
        return;
      }
      searchItem();
    }
  }

  function searchItem(){
    const searchKey = selector.map(({searchKey}) => searchKey);
    for(let record in storedItem){
      const $row = $("#" + storedItem[record][attributes[0]]);
      $row.hide();
      let show = true;
      for(let x=0; x<searchKey.length;x++){
        if(searchKey[x] === undefined) continue;
        else{
          if(storedItem[record][selector[x].field] != searchKey[x]){
            show = false;
          }
        }
      }
      if(_searchItem!==null){
        let _show = false;
        for(let field in storedItem[record]){
          if(field=='id')continue;
          const target = storedItem[record][field].toString().toUpperCase();
          if(show && target.includes(_searchItem.toString().toUpperCase())){
            _show = true;
          }
        }
        if(!_show){
          show = false;
        }
      }
      if(show){
        $row.show();
        for(let x=1;x<3;x++){
          const options = Array.from(selector[x].bar.children).map(({value}) => value);
          if(searchKey[x-1]!==undefined&&!options.includes(storedItem[record][selector[x].field])){
            createOption(storedItem[record][selector[x].field], x+1);
          }
        }
      }
    }
    if(!$("#showAll").prop("checked") ){
      hideColumn();
    }
    pagination.case_search();
  }

  function pagination(){
    let $table;
    let sumRows;
    let pageSize = document.getElementById('pagerSize').value;
    let sumPages;
    let currentPage = 0;
    const pager = document.getElementById('pager');
    document.getElementById('pager').firstElementChild.addEventListener('click', () => {
      currentPage = 0;
      $table.trigger("paging");
      limitPager();
    });
    document.getElementById('pager').lastElementChild.addEventListener('click', () => {
      currentPage = parseInt(sumPages) - 1;
      $table.trigger("paging");
      limitPager();
    });
    function setTable(){
      $table = $('table tbody tr:visible');
      sumRows = $table.length;
      bindTable();
    }
    function bindTable(){
      sumPages = Math.ceil(sumRows/pageSize);
      $table.unbind().bind('paging', () => {
        $table.hide().slice(currentPage*pageSize,(parseInt(currentPage)+1)*pageSize).show();
      });
      $('#pager a:not(:first-child,:last)').remove();
      for(let pageIndex = 0 ; pageIndex<sumPages ; pageIndex++)
      {
        const page = document.createElement('a');
        page.classList.add('w3-bar-item');
        page.text = pageIndex + 1;
        page.setAttribute('href', '#');
        page.setAttribute("value", pageIndex);
        page.addEventListener('click', event => {
          currentPage = event.target.getAttribute('value');
          $table.trigger("paging");
          limitPager();
        });
        pager.insertBefore(page, pager.lastElementChild);
      }
      limitPager();
      $table.trigger("paging");
    }
    function setPageSize(size){
      pageSize = size;
      currentPage = 0;
    }
    function limitPager(){
      let cp = parseInt(currentPage) + 1;
      cp = ( cp > parseInt(sumPages) - 2 )? parseInt(sumPages) - 2 : cp;
      $('#pager a:not(:first-child,:last)').hide();
      for(let x = cp - 2 ; x <= cp + 2 ; x++)
      {
        if ( x < 1 )
        {
          cp += 1;
          continue;
        }
        if ( x > sumPages ) break;
        $('#pager a:nth-child(' + ( x + 1 ) + ')').show();
      }
    }
    function case_changeSize(size){
      setPageSize(size);
      bindTable();
    }
    function case_search(){
      currentPage = 0;
      setTable();
      bindTable();
    }
    pagination.case_changeSize = case_changeSize;
    pagination.case_search = case_search;
    pagination.setTable = setTable;
    pagination.setPageSize = setPageSize;
  }

  function createOption(item, number){
    const option = document.createElement('option');
    if(item === null){
      option.appendChild( document.createTextNode("") );
    }
    else {
      option.appendChild( document.createTextNode(item) );
      option.value = item;
    }
    selector[number-1].bar.appendChild(option);
  }

  function clearOption(number){
    $(selector[number-1].bar).empty();
    createOption(null, number);
    delete selector[number-1].searchKey;
  }

  function createFormInput(name, value, readOnly){
    const item = document.createElement("INPUT");
    item.setAttribute("type", "text");
    // item.style.textAlign = "center";
    if(readOnly){
      item.setAttribute("readOnly", true);
    }
    if(name!=null){
      item.setAttribute("name", name);
    }
    if(value!=null){
      item.setAttribute("value", value);
    }
    return item;
  }

  function getInputData(){
    const inputData = {};
    const fieldArray = [];
    const input = $('#itemForm').serializeArray();
    for( let i = 0 ; i < input.length ; i++ ){
      const field = input[i++];
      const values = input[i];
      if(field.value==""||values.value==""){
        inputData.incompleteError = i-1;
        break;
      }
      if(fieldArray.includes(field.value)){
        inputData.DuplicateError = i-1;
        break;
      }
      fieldArray.push(field.value);
      inputData[field.value] = values.value;
    }
    return inputData;
  }

  function request(data, success, table) {
    data.table = (table===undefined)?targetTable:table;
    httpRequest.data = JSON.stringify(data);
    httpRequest.success = success;
    $.ajax(httpRequest);
  }

  // handle elements event

  function handleUpdateTable(){
    let data = {operation: "scan"};
    request(data, handleScanResponse);
  }

  function modal(event){
    function initialize(){
      event.preventDefault();
      modal.show_Modal = show_Modal;
      let $target = $(event.target).parent();
      if( !($($target).is("tr")) ){
        $target = $($target).parent();
      }
      var id = $target.prop('id');
      constantAttributes.forEach( attribute => {
        $('#form').append(createInput(attribute, '', (attribute==constantAttributes[0])?false:true));
      });
      show_Modal(id);
    }
    function show_Modal(id){
      function createForm(){
        for(let key in item){
          if(key=="id") continue;
          let $input = $('#modal input.form-control[name=\'' + key + '\']');
          if($input.length != 0 ){
            $('#modal input.input-group-text[value=\'' + key + '\']').val(key); // for undo
            $input.val(item[key]);
          }
          else{
            $('#form').append(createInput(key, item[key], true));
          }
        }
      }
      function remove_Input(button){
        $(button).parent().remove();
      }
      function edit(){
        modal.remove_Input = remove_Input;
        $('#modal .edit').show();
        $('#undo').click( () => {
          modal.remove_Input = null;
          $('#modal .edit').unbind().hide();
          $('#edit').show().click(edit);
          $('#remove').show().click(remove);
          $('.maintain').show().click(maintain);
          $('#modal input').attr('readonly', true);
          $('.temporary').remove();
          createForm();
        });
        $('#add').click( () => {
          $('#form').append(getHtml([
            '<p class="temporary">',
            '<input type="text" class="input-group-text">',
            '<input type="text" class="form-control">',
            '<button class="edit" onclick="modal.remove_Input(this)" style="display:inline"><i class="fa fa-close"></i></button>',
            '</p>'
          ]));
          $('.temporary button.edit').show();
        });
        $('#save').click( () => {
          function handleResponse(results){
            if(results.status=="ok"){
              let index = storedItem.indexOf(item);
              storedItem[index] = item = items;
              deleteItem.forEach( attribute => {
                $('#form input.form-control[name=\'' + attribute + '\']').parent().remove();
              });
              $('#undo').click();
              handleScanResponse(results);
            }
            else {
              alert("Update Item Failed.");
              $('#undo').click();
            }
          }
          const items = {};
          const attributes = [];
          const input = $('#modal input');
          let changed = false;
          for( let x = 0 ; x < input.length ; x++ ){
            const attribute = input[x++];
            const record = input[x];
            if(attribute.value==""||record.value==""){
              // items.incompleteError = x-1;
              alert("Incompleted Error");
              return;
            }
            if(attributes.includes(attribute.value)){
              // items.DuplicateError = x-1;
              alert("Duplicate Error");
              return;
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
          var deleteItem = Object.keys(item).filter( attribute => {
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
          const data = {table:"Hardware", operation: "table_Update", pk: id};
          data.input = (changed)? items:null;
          data.delete = (deleteItem.length!=0)? deleteItem:null;
          request(data, handleResponse);
        });
        $('#modal .form-control').removeAttr('readonly');
        $('#modal .input-group-text:not(.readonly)').removeAttr('readonly');
        $('.maintain').unbind().hide();
        $('#remove').unbind().hide();
        $('#edit').unbind().hide();
      }
      function maintain(){
        function handleResponse(results){
          modal.edit = edit;
          modal.maintain = maintain;
          modal.quit = quit;
          if(results.Items.length!=0){
            user_Identity.listUsers(id, results.Items[0]);
          }
          else{
            user_Identity.listUsers(id);
          }
        }
        const data = {operation: "scanMaintenanceRecord", target: id};
        request(data, handleResponse, 'Maintenance');
      }
      function remove(){
        function handleDeleteResponse(results){
          if(results.status=="ok"){
            quit();
            handleScanResponse(results);
            alert("Delete Item Successed.");
          }
          else{
            alert("Delete Item Failed.");
          }
        }
        let data = {operation: "delete", pk: id};
        request(data, handleDeleteResponse);
      }
      function quit(){
        $('#edit').unbind().hide();
        $('#remove').unbind().hide();
        $('#modal .edit').unbind().hide();
        $('#modal').hide();
        $('#form p').remove();
        $('#modal .form-control').val('');
        $('#maintain-select').empty();
        $('#quit').unbind();
        modal.show_Modal = null;
        modal.remove_Input = null;
      }
      let item = storedItem.find(record => {
        return record.id == id
      });
      $('#modal').show();
      $('.maintain').show().click(maintain);
      $('#remove').show().click(remove);
      $('#edit').show().click(edit);
      $('#quit').click(quit);
      createForm();
    };
    function createInput(attribute, record, button){
      let item = [
        '<p>',
        '<input type="text" class="input-group-text" value=\'' + attribute + '\' readonly>',
        '<input type="text" class="form-control" name=\'' + attribute + '\' value=\'' + record + '\' readonly>'
      ];
      if(button){
        item.push('<button class="edit" onclick="modal.remove_Input(this)"><i class="fa fa-close"></i></button>');
      }
      item.push('</p>');
      return getHtml(item);
    }
    initialize();
  }

  // handle Response

  function handleScanResponse(results){
    function clearTable(){
      $("#table thead tr").empty();
      $('#table tbody').empty();
      if(targetTable == 'Hardware'){
        for(let x=1;x<=selector.length-1;x++){
        clearOption(x);
      }
        $(selector[0].bar).children().first().html('All');
      }
    }
    function insertHeaderRow(){
      const attrs = storedItem.map(item => Object.keys(item));
      let _headers = attrs.map( attr => {
        let headers = attr.map( field => {
          if( !attributes.includes(field) ){
            attributes.push(field);
            return '<th id=\'' + field + '\'>' + field + '</th>';
          }
        });
        headers = headers.filter( header => header );
        return getHtml(headers);
      });
      $('#table thead tr').html(_headers);
    }
    function insertBodyRow(){
      const tableBody = document.querySelector("#table tbody");
      storedItem.forEach( item => {
        const bodyRow = tableBody.insertRow();
        bodyRow.id = item[attributes[0]];
        const bodyCell = [];
        attributes.forEach( attribute => {
          if(attribute!=attributes[0]){
            const cell = bodyRow.insertCell();
            cell.headers = attribute;
            bodyCell.push(cell);
          }
        });
        if(targetTable=="Hardware"){
          const options = Array.from(selector[0].bar.children).map(({value}) => value);
          console.log(options);
          for(let field in item){
          if(field!=attributes[0]){
            if(field==selectFields[0] && !options.includes(item[field])){
              createOption(item[field], 1);
            }
            const input = createFormInput(field, item[field],true);
            const index = $.inArray(field,attributes);
            bodyCell[index-1].appendChild(input);  // since there is no id field -> index - 1
          }
        }
        }
      });
    }
    clearTable();
    attributes.length = 0;
    storedItem = results.Items;
    attributes.push(results.pk);
    insertHeaderRow();
    insertBodyRow();
    pagination.setTable();
    if(!$("#showAll").prop("checked") ){
      hideColumn();
    }
  }

  function getHtml(template) {
    return template.join('\n');
  }
