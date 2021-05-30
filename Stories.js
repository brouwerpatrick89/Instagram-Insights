function sync_IG_stories_data() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Stories");
  var token = "YOUR_ACCESS_TOKEN";
  
  IG_stories_objects(token,sheet);
}

function IG_stories_objects(token,sheet) {

  var userID = "YOUR_USER_ID";
  var url = "https://graph.facebook.com/v9.0/" + userID + "/stories?access_token=" + token;
  
  var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
  var json = response.getContentText();
  var dataObject = JSON.parse(json);
  
  var firstRow = sheet.getRange(1,8).getValues();
  if (firstRow == "") {
    var header = ["Story ID","Date","Impressions","Reach","Exits","Replies","Taps Forward","Taps Back"];
    sheet.appendRow(header);
  }
  var objectID = [];
  
  if (dataObject.data != "") {
    if (dataObject.data.length == 1) {
      var idRange = sheet.getRange(sheet.getLastRow(),1).getValues();
      if (idRange != dataObject.data[0].id) {
        sheet.appendRow([dataObject.data[0].id]);
      }
    } else {
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
    }
  }
  IG_stories_metadata(token,sheet);
}

function IG_stories_metadata(token,sheet) {
  
  var dateLastRow = sheet.getRange(2, 2, sheet.getLastRow()-1).getValues().reverse();
  var startRow = 2;
  var lastRow = sheet.getLastRow();

  for (var k = 0; k < dateLastRow.length; k++) {
    if (dateLastRow[k] == ""){
      continue;
    } else {
      var startRow = lastRow - dateLastRow.indexOf(dateLastRow[k]) + 1;
      break;
    }
  }
  
  var idRange = sheet.getRange("A" + startRow + ":A" + lastRow + "").getValues();
  var loopRange = lastRow - startRow + 1;

  for (var k = 0; k < loopRange; k++) {
    var url = "https://graph.facebook.com/v9.0/" + idRange[k] + "?fields=timestamp&access_token=" + token;
    var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
    var json = response.getContentText();
    var metadataObject = JSON.parse(json);
    var dateRange = sheet.getRange(startRow, 2, 1);
    dateRange.setValue(new Date(metadataObject.timestamp));

    startRow = startRow + 1;
  }
  IG_stories_insight(token,sheet);
}

function IG_stories_insight(token,sheet) {
  
  var dateLastRow = sheet.getRange(2, 2, sheet.getLastRow()).getValues().reverse();
  var valueRange = sheet.getLastRow();
  var currentDate = new Date();
  var startRow = 2;
  var lastIndexDifference = (currentDate - new Date(dateLastRow[dateLastRow.length-1]))/1000/60/60;
  var lastRow = sheet.getLastRow();

  for (var l = 0; l < dateLastRow.length; l++) {
    if (lastIndexDifference <= 24){
      break;
    } else if (dateLastRow[l] == "") {
      continue;
    } else {
      var objectDate = new Date(dateLastRow[l]);
      var dateDifference = (currentDate - objectDate)/1000/60/60;
      if (dateDifference <= 24) {
        continue;
      } else {
        var startRow = valueRange - dateLastRow.indexOf(dateLastRow[l]) + 2;
        break;
      }
    }
  }
  
  var mediaRange = sheet.getRange("A" + startRow + ":A" + lastRow + "").getValues();
  var loopRange = lastRow - startRow + 1;
  
  for (var m = 0; m < loopRange; m++) {
    var insightRange = sheet.getRange("C" + startRow + ":H" + startRow);
    var mediaID = mediaRange[m][0];
    
    var url = "https://graph.facebook.com/v9.0/" + mediaID + "/insights?metric=impressions,reach,exits,replies,taps_forward,taps_back&access_token=" + token;
    var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
    var json = response.getContentText();
    var insightObject = JSON.parse(json);
    var container = [];
    
    if (insightObject.error == null) {
      //impressions
      container.push(insightObject.data[0].values[0].value);
      //reach
      container.push(insightObject.data[1].values[0].value);
      //exits
      container.push(insightObject.data[2].values[0].value);
      //replies
      container.push(insightObject.data[3].values[0].value);
      //taps forward
      container.push(insightObject.data[4].values[0].value);
      //taps back
      container.push(insightObject.data[5].values[0].value);
    } else {
      continue;
    }
    
    insightRange.setValues([container]);
    startRow = startRow + 1;
    
  }
}