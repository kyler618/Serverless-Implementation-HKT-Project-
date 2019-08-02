// Goals: control buttons display, path
var Users = window.Users || {};
var bucket = _config.s3.bucket;
var s3;
var path;

Users.authToken.then((token) => {
  let region = _config.cognito.region;
  let key = 'cognito-idp.' + region + '.amazonaws.com/';
  let logins = {};
  function loadSelectBarData(token){
    let identityCode = jwt_decode(token).iss.replace('https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_', '');
    let xhttp = new XMLHttpRequest();
    let url = _config.api.invokeUrl;
    let data = JSON.stringify({table: "Customer_and_Software", operation: "s3Query"});
    switch(identityCode){
      case 'DevfD3lWf':
        url += '/support';
        key +=  _config.cognito.support_userPoolId;
        break;
      case 'p7IxZwAdF':
        url += '/field-engineer';
        key +=  _config.cognito.fieldEng_userPoolId;
        break;
    }
    logins[key] = token;
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let selectBar = document.getElementById('select-folder');
        let results = JSON.parse(this.response).Items;
        results.forEach( result => {
          let endUser = result.Billed_customer_name;
          let option = document.createElement("OPTION");
          option.setAttribute("value", endUser);
          option.appendChild(document.createTextNode(endUser));
          selectBar.appendChild(option);
        });
      }
    };
    xhttp.open("POST", url);
    xhttp.setRequestHeader("Authorization", token);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(data);
    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: _config.cognito.identityPoolId,
      Logins: logins
    });
    AWS.config.credentials.refresh((error) => {
      if (error) {
        console.error(error);
      } else {
        objectOps();
        s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          params: {Bucket: bucket}
        });
      }
    });
  }
  if (token) {
    loadSelectBarData(token);
  } else {
    window.location.href = '/signin.html';
  }
}).catch((error) => {
  window.location.href = 'index.html';
});

function getHtml(template) {
  return template.join('\n');
}

function listFolder() {
  s3.listObjects({ Delimiter: '/', Prefix: path }, function(err, data) {
    if (err) {
      return alert('There was an error : ' + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    objectOps.push(data.Prefix);
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + bucket + '/';
    var folder = data.CommonPrefixes.map(function(file){
      var filesName = file.Prefix;
      filesName = filesName.slice(0,-1);
      let index = filesName.lastIndexOf("/") + 1;
      filesName = filesName.slice(index, filesName.length);
      return getHtml([
            '<input type="checkbox" onclick="objectOps.pushFolder(\'' + file.Prefix + '\')"/>',
            '<span onclick="prefix_add(\'' + filesName + '\');objectOps.clear();listFolder();">',
              filesName,
            '</span>',
            '<br>'
      ]);
    });
    var files = data.Contents.map(function(file) {
      var fileKey = file.Key;
      if(file.Size==0) return;
      var fileUrl = bucketUrl + encodeURIComponent(fileKey);
      var fileName = fileKey.replace(path, '');
      return getHtml([
        '<span>',
          '<div>',
            '<input type="checkbox" onclick="objectOps.push(\'' + fileKey + '\')"/>',
            '<a href="' + fileUrl + '">',
              fileName,
            '</a>',
          '</div>',
        '</span>'
      ]);
    });
    var htmlTemplate = [
        getHtml(folder),
        getHtml(files),
    ];
    document.getElementById('list-item').innerHTML = getHtml(htmlTemplate);
  });
}

function uploadOps(){
  var pushedItems;
  var counter;
  function initialize(){
    pushedItems = [];
    counter = 0;
    uploadOps.inputClicked = inputClicked;
    uploadOps.push = push;
    uploadOps.upload = upload;
    uploadOps.uploadFile = uploadFile;
    uploadOps.haveUploadItems = haveUploadItems;
    uploadOps.postOperation = postOperation;
    uploadOps.addCounter = addCounter;
    document.getElementById('dropDiv').addEventListener('dragover', dragHover);
    document.getElementById('dropDiv').addEventListener('dragleave', dragHover);
    document.getElementById('dropDiv').addEventListener('drop', drop_Handler);
    document.getElementById('upload-Modal').style.display = 'block';
  }
  function finalize(){
    pushedItems = null;
    counter = null;
    uploadOps.inputClicked = null;
    uploadOps.push = null;
    uploadOps.upload = null;
    uploadOps.uploadFile = null;
    uploadOps.haveUploadItems = null;
    uploadOps.postOperation = null;
    uploadOps.addCounter = null;
    document.getElementById('dropDiv').removeEventListener('dragover', dragHover);
    document.getElementById('dropDiv').removeEventListener('dragleave', dragHover);
    document.getElementById('dropDiv').removeEventListener('drop', drop_Handler);
  }
  function dragHover(event) {
    event.stopPropagation();
    event.preventDefault();
    event.target.className = (event.type === 'dragover')? 'over':'';
  }
  function drop_Handler(event){
    event.stopPropagation();
    event.preventDefault();
    event.target.className = '';
    let items = event.dataTransfer.items;
    (Array.from(items)).forEach(item=>{
      item = item.webkitGetAsEntry();
      if(item)
      {
        uploadOps.push(item);
      }
    });
    if(uploadOps.haveUploadItems())
    {
      document.getElementById("upload-modal-initial").style.display = "none";
      document.getElementById("upload-modal").style.display = "block";
    }
  }
  async function scanFiles(item, folderPath) {
    async function getFile(fileEntry) {
      try {
        return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
      } catch (err) {
        console.log(err);
      }
    }
    if (item.isDirectory) {
      let folderKey = path + item.fullPath.slice(1,item.fullPath.length) + "/";
      objectOps.createFolder(folderKey, true);
      let directoryReader = item.createReader();
      directoryReader.readEntries(function(entries) {
        entries.forEach(function(entry) {
          scanFiles(entry, folderKey);
        });
      });
    }
    else {
      counter++;
      let file = (item.constructor.name=='File')?item:await getFile(item);
      let fileKey = folderPath + file.name;
      uploadFile(fileKey, file);
    }
  }

  function inputClicked(){
    let files = document.getElementById('uploadInput').files;
    (Array.from(files)).forEach(file=>{
      push(file);
    });
    document.getElementById('uploadInput').value = "";
    if(haveUploadItems())
    {
      document.getElementById("upload-modal-initial").style.display = "none";
      document.getElementById("upload-modal").style.display = "block";
    }
  }
  function push(item){
    if(!haveUploadItems()||(!pushedItems.some(pushedItem=>{
      if(pushedItem.name==item.name)
      {
        alert('The file\'s name duplicates with existed file. ')
        return true;
      }
    })))
    {
      pushedItems.push(item);
      const bodyRow = document.getElementById('upload-tbody').insertRow();
      const bodyCell = bodyRow.insertCell();
      bodyCell.innerHTML = item.name;
      const deleteSpan = document.createElement('span');
      deleteSpan.innerHTML = 'x';
      deleteSpan.onclick = () => {
        bodyRow.remove();
        pushedItems = pushedItems.filter(pushedItem=>pushedItem.name!=item.name);
      };
      bodyRow.appendChild(deleteSpan);
    }
  }
  function upload(){
    pushedItems.forEach(pushedItem => {
      scanFiles(pushedItem, path);
    });
  }
  function uploadFile(key, file){
    s3.upload({
      Key: key,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        return alert('There was an error uploading your file: ', err.message);
      }
      postOperation(false);
    });
  }
  function haveUploadItems(){
    return pushedItems.length!=0;
  }
  function postOperation(cancel){
    if ( counter-- == pushedItems.length ) {
      pushedItems.pop();
    }
    if ( cancel || counter == 0 ) {
      let tableBody = document.getElementById('upload-tbody');
      let items = document.querySelectorAll('#upload-tbody tr');
      pushedItems.splice(0, pushedItems.length);
      items.forEach(item=>{
        tableBody.removeChild(item);
      })
      document.getElementById("upload-modal-initial").style.display = "block";
      document.getElementById("upload-modal").style.display = "none";
      document.getElementById('upload-Modal').style.display = "none";
      finalize();
      if(!cancel) listFolder();
    }
  }
  function addCounter(){
    counter++;
  }

  initialize();
}

function objectOps(){
  var pushedKeys;
  var cutKeys;
  var _remove;
  function initialize(){
    pushedKeys = [];
    cutKeys = [];
    _remove = false;
    objectOps.push = push;
    objectOps.pushAll = pushAll;
    objectOps.pushFolder = pushFolder;
    objectOps.createFolder = createFolder;
    objectOps.handle_createFolder = handle_createFolder;
    objectOps.cut = cut;
    objectOps.paste = paste;
    objectOps.rename = rename;
    objectOps.clear = pushedKeys_Clear;
    objectOps.dropDown = dropDown;
  }
  function push(key){
    if(pushedKeys.includes(key))
    {
      if(key!=pushedKeys[0])
      {
        pushedKeys = pushedKeys.filter(pushedKey=>pushedKey!=key);
      }
    }
    else
    {
      pushedKeys.push(key);
    }
  }
  function pushAll(){
    let checked = document.getElementById('selectAllBoxes').checked;
    let all = document.querySelectorAll('input[type=checkbox]:not(#selectAllBoxes)');
    (Array.from(all)).map((box)=>{
      if(checked!=box.checked)
      {
        box.click();
      }
    });
  }
  function pushFolder(key){
    s3.listObjects({ Delimiter: '/', Prefix: key }, function(err, data) {
      data.CommonPrefixes.map(function(file){
        pushFolder(file.Prefix);
      });
      data.Contents.map(function(file) {
        push(file.Key);
      });
    });
  }
  function createFolder(key, upload){
    s3.headObject({Key: key}, function(err, data) {
        if(upload){
          uploadOps.addCounter();
        }
        else{
          if (!err) {
            return alert('Folder already exists.');
          }
          if (err.code !== 'NotFound') {
            return alert('There was an error creating your folder: ' + err.message);
          }
        }
        s3.putObject({Key: key}, function(err, data) {
          if (err) {
            return alert('There was an error creating your folder: ' + err.message);
          }
          if(upload){
            uploadOps.postOperation(false);
          }
          else{
            listFolder();
          }
        });
      });
  }
  function handle_createFolder(folderName) {
    if (!folderName) return;
    if (!folderName.trim()) return alert('Folder names must contain at least one non-space character.');
    if (folderName.indexOf('/') !== -1) {
      return alert('Folder names cannot contain slashes.');
    }
    var key = path + folderName + '/';
    createFolder(key, false);
    // How to confirm upload is success?
    alert('Successfully created folder.');
  }
  function cut(remove_){
    cutKeys = cutKeys.splice(0, this.length);
    _remove = remove_;
    for(let key in pushedKeys)
    {
      let cutKey = {Key:pushedKeys[key]};
      cutKeys.push(cutKey);
    }
  }
  function paste(){
    pushedKeys_Internal_Clear();
    if(cutKeys.length==0) return;
    copy(cutKeys);
  }
  function rename(name){
    if(name==null)
    {
      return document.querySelector('input[type="checkbox"]:not(#selectAllBoxes):checked').click();
    }
    cut(true);
    pushedKeys_Internal_Clear();
    let target = cutKeys[1].Key;
    target = target.replace(cutKeys[0].Key, '');

    if( target.lastIndexOf("/") == target.length-1 )
    {
      target = target.slice(0, target.length-1);
      let replaceKey = cutKeys[1].Key.replace(target, name);
      s3.headObject({Key: replaceKey}, (err, data) => {
          if (!err) {
            return handleError('Folder already exists.');
          }
          if (err.code !== 'NotFound') {
            return handleError('There was an error renaming your folder: ' + err.message);
          }
          let folders = [];
          for(let key = 1; key < cutKeys.length; key++)
          {
            let cutKey = cutKeys[key].Key.replace(target, name);
            if( cutKey.lastIndexOf("/") == cutKey.length-1 )
            {
              s3.putObject({Key: cutKey}, function(err, data) {
                if (err) {
                  return handleError('There was an error renaming your folder: ' + err.message);
                }
                if(key==cutKeys.length-1)
                {
                  remove();
                }
              });
            }
            else
            {
              const params = {
                CopySource : bucket + "/" + cutKeys[key].Key,
                Key : cutKey
              };
              s3.copyObject(params, (copyErr, copyData) => {
                if (copyErr) {
                  console.log(copyErr);
                }
                else {
                  if(key==cutKeys.length-1)
                  {
                    remove();
                  }
                }
              });
            }
          }
        });
    }
    else
    {
      let index = target.indexOf('.');
      target = target.slice(0, index);
      let replaceKey = cutKeys[1].Key.replace(target, name);
      s3.headObject({Key: replaceKey}, function(err, data){
        if (!err) {
          return handleError('The name duplicates with existed file.');
        }
        if (err.code !== 'NotFound') {
          return handleError('There was an error : ' + err.message);
        }
        const params = {
          CopySource : bucket + "/" + cutKeys[1].Key,
          Key : replaceKey
        };
        s3.copyObject(params, (copyErr, copyData) => {
          if (copyErr) {
            console.log(copyErr);
          }
          else {
            remove();
          }
        });
      });
    }
  }
  function pushedKeys_Clear(){
    pushedKeys.splice(0, pushedKeys.length);
  }
  function dropDown(){
    let display = document.getElementById("dropDownList").style.display;
    document.getElementById("dropDownList").style.display = (display=='block')? 'none' : 'block';
    window.onclick = event => {
      if (!event.target.matches('.dropbtn')) {
        document.getElementById("dropDownList").style.display = 'none';
      }
    }
  }

  function copy(copyKeys){
    let source = copyKeys[0].Key;
    var folders = [];
    for(let key = 1; key < copyKeys.length; key++)
    {
      let copyKey = copyKeys[key].Key;
      if( copyKey == path )
      {
        return handleError('The destination folder is a subfolder of the source folder.');
      }
      copyKey = copyKey.replace(source, '');
      let index = copyKey.lastIndexOf("/");
      if( index == copyKey.length-1 )
      {
        let newKey = path + copyKey;
        folders.push(copyKey);
        s3.headObject({Key: newKey}, function(err, data) {
          if (!err) {
            return handleError('Folder already exists.');
          }
          if (err.code !== 'NotFound') {
            return handleError('There was an error : ' + err.message);
          }
          s3.putObject({Key: newKey}, function(err, data) {
            if (err) {
              return handleError('There was an error copying your folder: ' + err.message);
            }
            if(key==copyKeys.length-1)
            {
              if(_remove)
              {
                remove();
              }
              else
              {
                listFolder();
              }
            }
          });
        });
      }
      else
      {
        if(folders.length==0)
        {
          copyKey = copyKey.slice(index+1, copyKey.length);
        }
        let newKey = path + copyKey;
        const params = {
          CopySource : bucket + "/" + cutKeys[key].Key,
          Key : newKey
        };
        s3.copyObject(params, (copyErr, copyData) => {
          if (copyErr) {
            return handleError('There was an error copying your file.');
          }
          else {
            if(key==copyKeys.length-1)
            {
              if(_remove)
              {
                remove();
              }
              else
              {
                listFolder();
              }
            }
          }
        });
      }
    }
  }
  function remove(){
    cutKeys.shift();
    s3.deleteObjects({Delete:{Objects:cutKeys}}, (deleteError, deleteData) => {
      if (deleteError)
      {
        console.log("There was an error deleting your file.");
      }
      listFolder();
    });
    cutKeys = cutKeys.splice(0, this.length);
  }
  function pushedKeys_Internal_Clear(){
    document.querySelectorAll('input:checked').forEach( input => {
      input.checked = false;
    });
    pushedKeys.splice(1, pushedKeys.length-1);
  }
  function handleError(message){
    cutKeys = cutKeys.splice(0, this.length);
    alert(message);
  }

  initialize();
}

function checkBoxClear(){
  document.querySelector('input[type="checkbox"]:not(#selectAllBoxes):checked').click();
}

function setSourcePath(source){
  path = source.value + '/';
  listFolder();
}

function prefix_add(folderName){
  path += folderName + '/';
  document.getElementById('current-Path').appendChild(document.createTextNode(" > "+folderName));
}

function prefix_remove() {
  if( path.indexOf("/") != path.lastIndexOf("/") )
  {
    let current = document.getElementById('current-Path');
    current.removeChild(current.lastChild);
    path = path.slice(0,-1);
    path = path.slice(0, path.lastIndexOf("/") + 1);
  }
}
