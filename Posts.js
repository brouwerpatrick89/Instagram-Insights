function IG_initial_media_objects() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Posts");
  var token = "YOUR_ACCESS_TOKEN";
  var userID = "YOUR_USER_ID";
  var url = "https://graph.facebook.com/v9.0/" + userID + "/media?access_token=" + token + "&limit=2500";
  
  var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
  var json = response.getContentText();
  var dataObject = JSON.parse(json);
  
  var objectID = [];
  var header = ["Media ID","Date","Type","Likes","Comments","Engagement","Impressions","Reach","Saved","Video Views"];
  sheet.appendRow([header]);
  
  for (var i = 0 ; i < dataObject.data.length; i++) {
    objectID.push(dataObject.data[i].id);
  }
  objectID.reverse();
  
  for (var j = 0; j < objectID.length; j++) {
    sheet.appendRow([objectID[j]]);
  }
  IG_media_metadata(token);
}

function sync_IG_media_data() {
  var token = "YOUR_ACCESS_TOKEN";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Posts");
  
  IG_media_objects(token,sheet);
}

function IG_media_objects(token,sheet) {
  
  var userID = "YOUR_USER_ID";
  var url = "https://graph.facebook.com/v9.0/" + userID + "/media?access_token=" + token;
  var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
  var json = response.getContentText();
  var dataObject = JSON.parse(json);
  var objectID = [];
  
  for (var i = 0 ; i < dataObject.data.length; i++) {
    objectID.push(dataObject.data[i].id);
  }
  
  objectID.reverse();
  
  var lastRow = sheet.getRange(sheet.getLastRow(), 1).getValue();
  var index = objectID.indexOf(lastRow);
  var newObjectID = objectID.slice(index+1, objectID.length);
  
  if (newObjectID != -1) {
    for (var j = 0; j < newObjectID.length; j++) {
    sheet.appendRow([newObjectID[j]]);
    }
  }
  IG_media_metadata(token,sheet);
}

function IG_media_metadata(token,sheet) {
  
  var dateLastRow = sheet.getRange(2, 2, sheet.getLastRow()).getValues().reverse();
  var valueRange = sheet.getLastRow();
  var currentDate = new Date();
  var startRow = 2;

  for (var k = 0; k < dateLastRow.length; k++) {
    if (dateLastRow[k] == ""){
      continue;
    } else {
      var objectDate = new Date(dateLastRow[k]);
      var dateDifference = (currentDate - objectDate)/1000/60/60/24;
      
      if (dateDifference <= 7) {
        continue;
      } else {
        var lastRow = dateLastRow.indexOf(dateLastRow[k]);
        var startRow = valueRange - lastRow + 1;
        break;
      }
    }
  }
  
  var mediaRange = sheet.getRange("A" + startRow + ":A" + valueRange + "").getValues();
  var loopRange = valueRange - startRow + 1;
  
  for (var l = 0; l < loopRange; l++) {
    var url = "https://graph.facebook.com/v9.0/" + mediaRange[l] + "?fields=timestamp,media_type,like_count,comments_count&access_token=" + token;
    var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
    var json = response.getContentText();
    var metadataObject = JSON.parse(json);
    var metadataRange = sheet.getRange("B"+startRow+":E"+startRow);
    var container = [];
    
    //date
    container.push(Utilities.formatDate(new Date(metadataObject.timestamp), "GMT", "MM/dd/yyyy"));
    //type
    container.push(metadataObject.media_type);
    //likes
    container.push(metadataObject.like_count);
    //comments
    container.push(metadataObject.comments_count);
    
    metadataRange.setValues([container]);
    startRow = startRow + 1;
  }
  IG_media_insight(token,sheet);
}

function IG_media_insight(token,sheet) {
  
  var dateLastRow = sheet.getRange(2, 2, sheet.getLastRow()).getValues().reverse();
  var valueRange = sheet.getLastRow();
  var currentDate = new Date();
  var startRow = 2;

  for (var m = 0; m < dateLastRow.length; m++) {
    if (dateLastRow[m] == ""){
      continue;
    } else {
      var objectDate = new Date(dateLastRow[m]);
      var dateDifference = (currentDate - objectDate)/1000/60/60/24;
      
      if (dateDifference <= 7) {
        continue;
      } else {
        var lastRow = dateLastRow.indexOf(dateLastRow[m]);
        break;
      }
    }
  }
  
  var startRow = valueRange - lastRow + 1;
  var mediaRange = sheet.getRange("A" + startRow + ":C" + valueRange + "").getValues();
  var loopRange = valueRange - startRow + 1;

  for (var n = 0; n < loopRange; n++) {
    var mediaType = mediaRange[n][2];
    var insightRange = sheet.getRange("F" + startRow + ":J" + startRow);
    var mediaID = mediaRange[n][0];
    
    if (mediaType == "CAROUSEL_ALBUM") {
      var url = "https://graph.facebook.com/v9.0/" + mediaID + "/insights?metric=carousel_album_engagement,carousel_album_impressions,carousel_album_reach,carousel_album_saved&access_token=" + token;
    }
    else  if (mediaType == "VIDEO") {
      var url = "https://graph.facebook.com/v9.0/" + mediaID + "/insights?metric=engagement,impressions,reach,saved,video_views&access_token=" + token;
    }
    else if (mediaType == "IMAGE") {
      var url = "https://graph.facebook.com/v9.0/" + mediaID + "/insights?metric=engagement,impressions,reach,saved&access_token=" + token;
    }
    else {
      continue;
    }
    
    var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
    var json = response.getContentText();
    var insightObject = JSON.parse(json);
    var container = [];
    
    //check for posts before conversion to business account
    if (insightObject.error != null) {
      container.push("-");
      container.push("-");
      container.push("-");
      container.push("-");
      container.push("-");
    } else {
      //engagement
      container.push(insightObject.data[0].values[0].value);
      //impressions
      container.push(insightObject.data[1].values[0].value);
      //reach
      container.push(insightObject.data[2].values[0].value);
      //saved
      container.push(insightObject.data[3].values[0].value);
      //video views
      if (mediaType == "VIDEO") {
        container.push(insightObject.data[4].values[0].value);
      } else {
        container.push("-");
      }
    }
    
    insightRange.setValues([container]);
    startRow = startRow + 1;
    
  }
}