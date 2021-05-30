function sync_IG_profile_data() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Profile");
  var token = "YOUR_ACCESS_TOKEN";
  var baseURL = "https://graph.facebook.com/v9.0/YOUR_USER_ID";
  var firstRow = sheet.getRange(1,9).getValues();
  if (firstRow == "") {
    var header = ["Date","Total Followers","Profile Views","Email Clicks","Direction Clicks","Call Clicks","Website Clicks","Impressions","Reach"];
    sheet.appendRow(header);
  }
  
  IG_profile_followers(token,baseURL,sheet);
}

function IG_profile_followers(token,baseURL,sheet) {

  var url = baseURL + "?fields=followers_count&access_token=" + token;
  var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
  var json = response.getContentText();
  var followersObject = JSON.parse(json);
  var currentDate = new Date();
  var formattedDate = Utilities.formatDate(new Date(currentDate), "GMT", "MM/dd/yyyy")
  var container = [formattedDate,followersObject.followers_count];
  
  IG_profile_metadata(token,baseURL,sheet,container);
}

function IG_profile_metadata(token,baseURL,sheet,container) {

  var url = baseURL + "/insights?metric=profile_views,email_contacts,get_directions_clicks,phone_call_clicks,website_clicks,impressions,reach&period=day&access_token=" + token;
  var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
  var json = response.getContentText();
  var metadataObject = JSON.parse(json);
  
  //profile_views
  container.push(metadataObject.data[0].values[0].value);
  //email_contacts
  container.push(metadataObject.data[1].values[0].value);
  //get_directions_clicks
  container.push(metadataObject.data[2].values[0].value);
  //phone_call_clicks
  container.push(metadataObject.data[3].values[0].value);
  //website_clicks
  container.push(metadataObject.data[4].values[0].value);
  //impressions
  container.push(metadataObject.data[5].values[0].value);
  //reach
  container.push(metadataObject.data[6].values[0].value);
  
  sheet.appendRow(container);
}