function sync_IG_audience_data() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Audience");
  var token = "YOUR_ACCESS_TOKEN";
  var baseURL = "https://graph.facebook.com/v9.0/YOUR_USER_ID";
  
  var firstRow = sheet.getRange(1,6).getValues();
  if (firstRow == "") {
    var header = ["Country Code","Country Count",,,"Age Group","Age Group Count"];;
    sheet.appendRow(header);
  }
  IG_audience_data(token,sheet,baseURL)
}

function IG_audience_data(token,sheet,baseURL) {
  
  var url = baseURL + "/insights?metric=audience_country,audience_gender_age,&period=lifetime&access_token=" + token;
  var response = UrlFetchApp.fetch(url, {"muteHttpExceptions": true});
  var json = response.getContentText();
  var audienceObject = JSON.parse(json);
  
  var startRow = 2;
  var audienceCountry = audienceObject.data[0].values[0].value;
  var countryCodes = ["AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT",
                      "AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW",
                      "BV","BR","IO","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL",
                      "CN","CX","CC","CO","KM","CG","CD","CK","CR","CI","HR","CU","CW","CY","CZ",
                      "DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI",
                      "FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU",
                      "GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR",
                      "IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW",
                      "KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MK","MG","MW","MY",
                      "MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS",
                      "MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP",
                      "NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA",
                      "RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA",
                      "SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK",
                      "SD","SR","SJ","SZ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO",
                      "TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU",
                      "VE","VN","VG","VI","WF","EH","YE","ZM","ZW"]
  
  for (var k=0; k < countryCodes.length; k++) {
    if (audienceObject.data[0].values[0].value[countryCodes[k]] != null) {
      var countryRange = sheet.getRange("A"+startRow+":B"+startRow+"");
      countryRange.setValues([[countryCodes[k],audienceObject.data[0].values[0].value[countryCodes[k]]]]);
      startRow += 1;
    } else {
      continue;
    }
  }
  
  var audienceAge = audienceObject.data[1].values[0].value;
  var ageGroup = ["F.65+","M.65+","U.65+","F.55-64","M.55-64","U.55-64","F.45-54",
                  "M.45-54","U.45-54","F.35-44","M.35-44","U.35-44","F.25-34","M.25-34",
                  "U.25-34","F.18-24","M.18-24","U.18-24","F.13-17","M.13-17","U.13-17"];
  var startRow = 2;
  
  for (var l=0; l < ageGroup.length; l++) {
    var ageRange = sheet.getRange("E"+startRow+":F"+startRow+"");
    
    if (audienceObject.data[1].values[0].value[ageGroup[l]] != null) {
      ageRange.setValues([[ageGroup[l],audienceObject.data[1].values[0].value[ageGroup[l]]]]);
    } else {
      ageRange.setValues([[ageGroup[l],0]]);
    }
    
    startRow += 1;
  }
}