// Backup
// Goal : , Bug:
var Users = window.Users || {};
var selectField1, selectField2, selectField3;
// pre-defined
var targetTable = $('#current').val();
switch(targetTable){
  case "Customer_and_Software":
    selectField1 = 'Billed_customer_name';
    selectField2 = 'Billed_Customer_Contact';
    selectField3 = 'Enduser_address_for_reference';
    break;
  case "Hardware":
    selectField1 = 'Enduser_name';
    selectField2 = 'Physical_Site_Address';
    selectField3 = 'Device_Type';
    $('#maintainButton').addClass('editItem');
    $('#selector').show();
    break;
}
var poolData = {
    UserPoolId : _config.cognito.userPoolId, // your user pool id here
    ClientId : _config.cognito.userPoolClientId // your client id here
};
if (!_config.api.invokeUrl) {
  $('#noApiMessage').show();
}

(function ($) {
  user_Identity();
  const selector = [];
  const attributes = [];
  let _searchItem;
  let storedItem;
  let constantAttributesIndex;
  var httpRequest = {
    method: 'POST',
    url: _config.api.invokeUrl + '/hkt-resource',
    contentType: 'application/json',
    async: true ,
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Error requesting: ', textStatus, ', Details: ', errorThrown);
      console.error('Response: ', jqXHR.responseText);
      alert('An error occured:\n' + jqXHR.responseText);
    }
  };
  console.log('version 1');

  // on start

  $( document ).ready(function() {
      initialize();
      pagination();
  });

  // basic functions

  function user_Identity(){
    let region = _config.cognito.region;
    let key = 'cognito-idp.' + region + '.amazonaws.com/' + _config.cognito.userPoolId;
    let logins = {};
    let userPool;
    var params = {
      AttributesToGet: [],
      Filter: "",
      UserPoolId: _config.cognito.userPoolId
    };
    AWS.config.region = region;
    AWS.config.correctClockSkew = true;
    function authorize(){
      Users.authToken.then((token) => {   // check user authority
        if (token) {
          httpRequest.headers = {Authorization: token};
          logins[key] = token;
        } else {
          // window.location.href = '/signin.html';
        }
      }).catch((error) => {
        // alert(error);
        // window.location.href = '/signin.html';
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
    function listUsers(){
      userPool.listUsers(params, (err, data) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log("data", data);
          $('#itemModel-maintain-sensorID').html($('#itemForm').children()[1].value);
          let users = (data.Users).map(user=>user.Username);
          $('#itemForm').hide();
          $('.editItem').hide();
          $('#itemModel-maintain-Container').show();
          $('#cancelButton').show().click( () => {
            $('#itemForm').show();
            $('.editItem').show();
            $('#itemModel-maintain-Container').hide();
            $('#itemModel-maintain-confirm').hide();
            $('#itemModel-maintain-sensorID').html("");
            $('#itemModel-maintain-select').empty();
            $('#cancelButton').unbind().hide();
          });
          $('#modalCancelButton').unbind().click( () => {
            hideModel();
            $('#itemForm').show();
            $('.editItem').unbind();
            $('#itemModel-maintain-Container').hide();
            $('#itemModel-maintain-confirm').hide();
            $('#cancelButton').unbind().hide();
            $('#itemModel-maintain-sensorID').html("");
            $('#itemModel-maintain-select').empty();
            $(this).unbind();
          });
          const default_Option = document.createElement('option');
          default_Option.appendChild( document.createTextNode(' -- Select Field Engineer -- ') );
          default_Option.disabled = true;
          default_Option.selected = true;
          $('#itemModel-maintain-select').append(default_Option);
          $('#itemModel-maintain-select').change( (event) => {
            if(event.target.value != null){
              $('#itemModel-maintain-confirm').show();
            }
          });
          $('#itemModel-maintain-confirm').click( () => {
            console.log($('#itemModel-maintain-select').val());
          });
          users.forEach(user => {
            const option = document.createElement('option');
            option.appendChild( document.createTextNode(users) );
            option.value = users;
            $('#itemModel-maintain-select').append(option);
          });
          console.log('user done 3');
        }
      });
    }
    initialize();
  }

  function initialize(){
    function selectorChange(event, x){
      if(x<=1)
      {
        if(x==0)
        {
          clearOption(2);
          $(selector[2].bar).prop('disabled', 'disabled').unbind();
        }
        clearOption(3);
      }
      if( event.target.selectedIndex == 0 )
      {
        if(x==0||x==1)
        {
          // $(selector[x+1].bar).children().first().html('');
          $(selector[x+1].bar).prop('disabled', 'disabled').unbind();
        }
        delete selector[x].searchKey;
      }
      else
      {
        if(x<=1)
        {
          if(x==0)
          {
            _searchItem = null;
          }
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
    const selectField = [selectField1, selectField2, selectField3];
    const selectBarText = $('#selector div span');
    const selectBar = $('#selector div select');
    const input = document.getElementById('searchBar');
    for(let x=0;x<selectBar.length;x++)
    {
      let name = selectField[x].replace(/\_+/g, ' ');
      $(selectBarText[x]).html(name+" :");
      selector.push({field:selectField[x], bar:selectBar[x]});
    }
    input.addEventListener("keyup", function(event) {
      event.preventDefault();
      if ($(this).val() == "")
      {
        _searchItem = null;
      }
      else
      {
        _searchItem = $(this).val();
      }
      // $(selector[0].bar).prop("selectedIndex", 0).change();
      searchItem();
    });

    $("#showAll").change( () => {
      ( $("#showAll").prop("checked") )?showColumn():hideColumn();
    });
    $(selector[0].bar).change( event => {selectorChange(event, 0)});
    $('#pagerSize').change(function(){
      pagination.case_changeSize(this.value);
    })

    handleUpdateTable();
    readMode();
    $('#test').click(handleTestClick);
  }

  function readMode(){
    function handleEditTable(){
      const changedRecord = [];
      $('.readMode').hide().unbind();
      $('.editMode').show().unbind();

      $("input[name='table_Input']").removeAttr("readOnly").change( event => {
        if(!changedRecord.includes(event.target.classList[1]))
        {
          changedRecord.push(event.target.classList[1]);
        }
      });

      $('#addItem').click( () => {
        function handlePutResponse(results){
          console.log(results);
          if(results.status=="ok"){
            hideModel();
            handleScanResponse(results);
            $("input[name='table_Input']").removeAttr("readOnly");
            alert("Put Item Successed.");
          }
          else
          {
            alert("Put Item Failed.");
          }
        }
        const itemForm = document.getElementById('itemForm');
        const selectFields = [selectField1, selectField2, selectField3];
        selectFields.forEach( selectField => {
          let field = createFormInput("field", selectField, true);
          let value = createFormInput("value", "", false);
          field.classList.add('input-group-text');
          value.classList.add('form-control');
          itemForm.appendChild(field);
          itemForm.appendChild(value);
          if(selectField != selectField1){
            let button = createRemoveButton();
            button.onclick = event => {
              event.preventDefault();
              field.parentNode.removeChild(field);
              value.parentNode.removeChild(value);
              button.parentNode.removeChild(button);
            };
            itemForm.appendChild(button);
          }
          itemForm.appendChild(document.createElement("P"));
        });

        $('.addItem').show().unbind();
        $('#itemModel').show();
        $('#addButton').click( () => {
          const field = createFormInput("form_Input", "", false);
          const value = createFormInput("form_Input", "", false);
          field.classList.add('input-group-text');
          value.classList.add('form-control');
          const button = createRemoveButton();
          button.onclick = event => {
            event.preventDefault();
            field.parentNode.removeChild(field);
            value.parentNode.removeChild(value);
            button.parentNode.removeChild(button);
          };
          itemForm.appendChild(field);
          itemForm.appendChild(value);
          itemForm.appendChild(button);
          itemForm.appendChild(document.createElement("P"));
        });
        $('#confirmButton').click( event => {
          const inputs = getInputData();
          if(inputs.incompleteError!==undefined)
          {
            alert("Incompleted Error");
            return;
          }
          if(inputs.DuplicateError!==undefined)
          {
            alert("Duplicate Error");
            return;
          }
          if(storedItem.map(x=>x[attributes[0]]).includes(inputs[attributes[0]]))
          {
            alert("Duplicate Error, the primary key duplicates with other record.");
            return;
          }
          const data = {operation: "put", input: inputs};
          request(data, handlePutResponse);
        });
        $('#modalCancelButton').click( () => {
          $(this).unbind();
          hideModel();
          $('#addButton').unbind();
          $('#confirmButton').unbind();
          $(this).unbind();
        });
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
        if(changedRecord.length==0)
        {
          readMode();
          return;
        }
        const updateRecords = [];
        const replaceRecords = [];
        for( let x = 0 ; x < changedRecord.length ; x++ )
        {
          let changed, replace = false;
          const pkey = changedRecord[x];
          const index = storedItem.map(x=>x[attributes[0]]).indexOf(pkey);
          const replaceRecord = {};
          const item = {};
          const record = Array.from($("input." + pkey));
          for( let y = 0 ; y < record.length ; y++ )
          {
            if(record[y].value == "")
            {
              alert("Incompleted Error.");
              return;
            }
            if(record[y].value != storedItem[index][record[y].classList[0]])
            {
              if(record[y].classList[0] == attributes[0])
              {
                if(storedItem.map(x=>x[attributes[0]]).includes(record[y].value))
                {
                  alert("Duplicate Error");
                  return;
                }
                replace = true;
                replaceRecord.pk = storedItem[index][record[y].classList[0]];
              }
              else
              {
                changed = true;
              }
            }
            item[record[y].classList[0]] = record[y].value;
          }
          if(replace)
          {
            replaceRecord.record = item;
            replaceRecords.push(replaceRecord);
          }
          else if(changed)
          {
            updateRecords.push(item);
          }
        }
        var data = {operation:'multipleUpdate'};
        data.input = (updateRecords.length!=0)? updateRecords:null;
        data.replace = (replaceRecords.length!=0)? replaceRecords:null;
        if(data.input!=null||data.replace!=null)
        {
          request(data, handleMultipleUpdateResponse);
        }
        else
        {
          readMode();
        }

      });
      $('table tbody').unbind().click( (event) => {
        const target = event.target;
        if(target.innerHTML=="" && target.tagName == "TD")
        {
          const field = target.classList[0];
          const pk = target.classList[1];
          const cell = "td." + field + "." + pk;
          const input = createFormInput("table_Input", "", false);
          input.classList.add(field);
          input.classList.add(pk);
          if(!changedRecord.includes(pk))
          {
            changedRecord.push(pk);
          }
          $(cell).append(input);
        }
      });
      $('#cancelEdit').click(function(){
        $(this).unbind();
        $('table tbody').unbind();
        if(changedRecord.length!=0)
        {
          for(let x=0; x<changedRecord.length; x++)
          {
            const pkey = changedRecord[x];
            const index = storedItem.map(x=>x[attributes[0]]).indexOf(pkey);
            const attrs = Object.keys(storedItem[index]);
            const record = Array.from($("input." + pkey));
            for(let y=0; y<record.length; y++)
            {
              const field = record[y].classList[0];
              const cell = "input." + field + "." + pkey;
              if(attrs.includes(field))
              {
                $(cell)[0].value = storedItem[index][field];
              }
              else
              {
                $(cell)[0].remove();
              }
            }
          }
        }
        readMode();
      })
    }

    $('.readMode').show();
    $('.editMode').hide();

    $("input[name='table_Input']").attr('readOnly', true).unbind();

    $('#editTable').click(handleEditTable);
    $('table tbody').click(handleRowClick);
    $('#updateTable').click(handleUpdateTable);
  }

  function hideColumn(){
    for(let x = 0 ; x < attributes.length ; x++){
      if(!constantAttributesIndex.includes(x))
      {
        $("td." + attributes[x]).hide();
      }
    }
  }

  function showColumn(){
    for(let x=0;x<attributes.length;x++)
    {
      if(!constantAttributesIndex.includes(x))
      {
        $("." + attributes[x]).show();
      }
    }
    if(selector[0].searchKey!==undefined || _searchItem!==null)
    {
      searchItem();
    }
  }

  function searchItem(){
    const searchKey = selector.map(({searchKey}) => searchKey);
    for(let record in storedItem)
    {
      const $row = $("#" + storedItem[record][attributes[0]]);
      $row.hide();
      // if(_searchItem!==null){
      //   for(let field in storedItem[record])
      //   {
      //     const target = storedItem[record][field].toString().toUpperCase();
      //     if(target.includes(_searchItem.toString().toUpperCase()))
      //     {
      //       $row.show();
      //     }
      //   }
      // }

      // if(searchKey[0]===undefined)
      // {
      //   $row.show();
      // }
      // else
      // {

        let show = true;
        for(let x=0; x<searchKey.length;x++)
        {
          if(searchKey[x] === undefined) continue;
          else
          {
            if(storedItem[record][selector[x].field] != searchKey[x])
            {
              show = false;
            }
          }
        }
        if(_searchItem!==null){
          let _show = false;
          for(let field in storedItem[record])
          {
            if(field=='id')continue;
            const target = storedItem[record][field].toString().toUpperCase();
            if(show && target.includes(_searchItem.toString().toUpperCase()))
            {
              _show = true;
            }
          }
          if(!_show){
            show = false;
          }
        }
        if(show)
        {
          $row.show();
          for(let x=1;x<3;x++)
          {
            const options = Array.from(selector[x].bar.children).map(({value}) => value);
            if(searchKey[x-1]!==undefined&&!options.includes(storedItem[record][selector[x].field]))
            {
              createOption(storedItem[record][selector[x].field], x+1);
            }
          }
        }
      // }
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

  function createRemoveButton(){
    const button = document.createElement("BUTTON");
    button.innerHTML = "<i class='fa fa-close'></i>";
    button.classList.add('addItem', 'removeAttr');
    return button;

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
    if(readOnly)
    {
      item.setAttribute("readOnly", true);
    }
    item.setAttribute("name", name);
    item.setAttribute("value",value);
    return item;
  }

  function getInputData(){
    const inputData = {};
    const fieldArray = [];
    const input = $('#itemForm').serializeArray();
    for( let i = 0 ; i < input.length ; i++ )
    {
      const field = input[i++];
      const values = input[i];
      if(field.value==""||values.value=="")
      {
        inputData.incompleteError = i-1;
        break;
      }
      if(fieldArray.includes(field.value))
      {
        inputData.DuplicateError = i-1;
        break;
      }
      fieldArray.push(field.value);
      inputData[field.value] = values.value;
    }
    return inputData;
  }

  function hideModel(){
    $('#itemForm').empty();
    $('.addItem').hide();
    $('.editItem').hide();
    $('#itemModel').hide();
  }

  function request(data, success) {
    data.table = targetTable;
    httpRequest.data = JSON.stringify(data);
    httpRequest.success = success;
    $.ajax(httpRequest);
  }

  // handle elements event

  function handleUpdateTable(){
    let data = {operation: "scan"};
    request(data, handleScanResponse);
  }

  function handleRowClick(event) {
    function buttonClick(){
      previousPk = event.target.classList[1];
      $('.addItem').hide().unbind();
      $('#cancelButton').hide();
      $('.editItem').show().unbind();

      $('button.removeAttr').unbind();
      $('#cancelButton').unbind();

      $('#deleteButton').click( () => {
        function handleDeleteResponse(results){
          if(results.status=="ok")
          {
            hideModel();
            handleScanResponse(results);
            alert("Delete Item Successed.");
          }
          else
          {
            alert("Delete Item Failed.");
          }
        }
        let data = {operation: "delete", pk: $('#itemForm')[0][1].value};
        request(data, handleDeleteResponse);
      });
      $('#editButton').click( () => {
        $('.addItem').show();
        $('#cancelButton').show();
        $('.editItem').hide().unbind();
        $('#modalCancelButton').unbind();
        $("input[name='form_Input']").removeAttr("readOnly");
        $('input#pk').attr('readOnly', true);
        const pkey = $('#itemForm')[0][1].value;
        $('#addButton').click( () => {
          const field = createFormInput("form_Input", "", false);
          const value = createFormInput("form_Input", "", false);
          field.classList.add('input-group-text');
          value.classList.add('form-control');
          const button = createRemoveButton();
          button.onclick = event => {
            event.preventDefault();
            field.parentNode.removeChild(field);
            value.parentNode.removeChild(value);
            button.parentNode.removeChild(button);
          };
          itemForm.appendChild(field);
          itemForm.appendChild(value);
          itemForm.appendChild(button);
          itemForm.appendChild(document.createElement("P"));
        });
        $('button.removeAttr').click( function(){
          if(this.id==="")
          {
            return;
          }
          const attr = "#itemForm input." + this.id;
          $(attr).remove();
          $("#" + this.id).remove();
        });
        $('#confirmButton').click( () => {
          function handleUpdateResponse(results){
            if(results.status=="ok"){
              $("input[name='form_Input']").attr("readOnly", true);
              handleRowClick.buttonClick();
              handleScanResponse(results);
              alert("Update Item Successed.");
            }
            else {
              handleRowClick.rollback();
              alert("Update Item Failed.");
            }
          }
          const inputs = getInputData();
          if(inputs.incompleteError!==undefined)
          {
            alert("Incompleted Error");
            return;
          }
          if(inputs.DuplicateError!==undefined)
          {
            alert("Duplicate Error");
            return;
          }
          let changed, replace = false;
          const index = storedItem.map(x=>x[attributes[0]]).indexOf(pkey);
          let deleteAttr = Object.keys(storedItem[index]);

          const data = {operation: "singleUpdate", pk: pkey};
          for(let x in inputs)
          {
            deleteAttr = deleteAttr.filter(attr=>attr!=x);
            if(inputs[x]!=storedItem[index][x])
            {
              if(x==attributes[0])
              {
                event.target.classList.remove(pkey);
                event.target.classList.add(inputs[x]);
                replace = true;
              }
              changed = true;
            }
          }
          if(changed)
          {
            data.input = inputs;
            if(replace)
            {
              data.operation = "singleReplace";
            }
            else
            {
              data.delete = (deleteAttr.length!=0)? deleteAttr:null;
            }
            request(data, handleUpdateResponse);
          }
          else
          {
            if(deleteAttr.length!=0)
            {
              data.input = null;
              data.delete = deleteAttr;
              request(data, handleUpdateResponse);
            }
            else
            {
              $('#itemForm').empty();
              handleRowClick(event);
            }
          }
        });
        $('#cancelButton').click(function(){
          $('#itemForm').empty();
          handleRowClick(event);
        });
        $('#modalCancelButton').click(function(){
          hideModel();
          $('.addItem').unbind();
          $('button.removeAttr').unbind();
          $('#modalCancelButton').unbind();
        });
      });
      $('#maintainButton').click( () => {
        user_Identity.listUsers();
      });
      $('#modalCancelButton').click(function(){
        hideModel();
        $('.editItem').unbind();
        $(this).unbind();
      });
    }
    function rollback(){
      event.target.classList.remove(event.target.classList[1]);
      event.target.classList.add(previousPk);
    }
    handleRowClick.buttonClick = buttonClick;
    handleRowClick.rollback = rollback;

    event.preventDefault();
    let previousPk;
    const itemForm = document.getElementById('itemForm');
    const index = Array.from($("td." + attributes[0])).map(x=>x.classList[1]).indexOf(event.target.classList[1]);
    const item = storedItem[index-1];
    for( let x=Object.keys(item).length-1 ; x>=0 ; x-- )
    {
      const fieldName = Object.getOwnPropertyNames(item)[x];
      const field = createFormInput('form_Input', fieldName, true);
      const value = createFormInput('form_Input', Object.values(item)[x], true);
      field.classList.add('input-group-text');
      value.classList.add('form-control');
      if(Object.getOwnPropertyNames(item)[x] == attributes[0])
      {
        field.id = attributes[0];
        itemForm.insertBefore(field, itemForm.childNodes[0]);
        itemForm.insertBefore(value, itemForm.childNodes[1]);
        itemForm.insertBefore(document.createElement("P"), itemForm.childNodes[2]);
      }
      else
      {
        field.classList.add(fieldName);
        value.classList.add(fieldName);
        itemForm.appendChild(field);
        itemForm.appendChild(value);
        const button = createRemoveButton();
        button.id = fieldName;
        itemForm.appendChild(button);
        itemForm.appendChild(document.createElement("P"));
      }
    }
    document.getElementById('itemModel').style.display='block';
    buttonClick();

  }

  function handleTestClick(event) {
    function testFunction(){
      // var object = {pk1:'56789', Test:'test20', Type:'row2', a:'abcde'}
      // var data = {operation: "test"};
      // request(data, handleTestResponse);

      console.log('OK');
    }
    function handleTestResponse(results){
      console.log('Response received from API: ', results);
    }
    event.preventDefault();
    testFunction();
  }

  // handle Response

  function handleScanResponse(results){
    function clearTable(){
      $("table thead tr").empty();

      $('table tbody').empty();
      for(let x=1;x<=selector.length-1;x++)
      {
        clearOption(x);
      }
      $(selector[0].bar).children().first().html('All');
    }
    function insertHeaderRow(){
      const headerRow = document.querySelector("table thead tr");
      // const headerCell = headerRow.insertCell();
      // headerCell.innerHTML = attributes[0];
      // headerCell.classList.add(attributes[0]);
      const attrs = storedItem.map(item => Object.keys(item));
      for(let x=0;x<attrs.length;x++)
      {
        for(let y=0;y<attrs[x].length;y++)
        {
          if(!attributes.includes(attrs[x][y]) && attrs[x][y] != "id")
          {
            attributes.push(attrs[x][y]);
            const headerCell = headerRow.insertCell();
            headerCell.innerHTML = attrs[x][y];
            headerCell.classList.add(attrs[x][y]);
          }
        }
      }
      const constantAttributes = [selectField1, selectField2, selectField3];
      constantAttributesIndex = constantAttributes.map(x => $.inArray(x,attributes));
    }
    function insertBodyRow(){
      const tableBody = document.querySelector("table tbody");
      for (let record in storedItem) {
        if (storedItem.hasOwnProperty(record)) {
          // const bodyRow = tableBody.insertRow();
          // bodyRow.id = storedItem[record][attributes[0]];
          const bodyCell = [];
          const options = Array.from(selector[0].bar.children).map(({value}) => value);
          for(let x = 0; x<attributes.length;x++)
          {
            const cell = bodyRow.insertCell();
            cell.classList.add(attributes[x]);
            cell.classList.add(storedItem[record][attributes[0]]);
            bodyCell.push(cell);
          }

          for(let field in storedItem[record])
          {
            if(field=='id') continue;
            if( targetTable=="Hardware" && field==selectField1 && !options.includes(storedItem[record][field]))
            {
              createOption(storedItem[record][field], 1);
            }
            const input = createFormInput("table_Input", storedItem[record][field],true);
            input.classList.add(field);
            input.classList.add(storedItem[record][attributes[0]]);
            const index = $.inArray(field,attributes);
            bodyCell[index].appendChild(input);
          }
        }
      }
    }
    // console.log('Response received from API: ', results);
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

}(jQuery));
