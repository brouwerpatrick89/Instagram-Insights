function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Sync Posts', functionName: 'sync_IG_media_data'},
    {name: 'Sync Stories', functionName: 'sync_IG_stories_data'},
    {name: 'Sync Profile', functionName: 'sync_IG_profile_data'},
    {name: 'Sync Audience', functionName: 'sync_IG_audience_data'}
  ];
  spreadsheet.addMenu('My Menu', menuItems);
}