// https://script.google.com/macros/s/AKfycbxF9h63nP2qj4nVL-qF1sz2L6cx2lClOueJ2QlCPKIpqrV2QrRRcpmyqesBObR-wAe8/exec

function doGet() {
  const sheet = SpreadsheetApp.openById('1AYGfxPBK6wOBtwoJW3A499JmLQdCzccav_9rnPXaJXU').getSheetByName('Sheet1'); // Replace with your sheet name
  const times = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat(); // Fetch times from column A, starting from row 2
  const desks = sheet.getRange(1, 2, 1, sheet.getLastColumn() - 1).getValues()[0]; // Fetch desk names from row 1, starting from column B

  let reservations = [];

  // Iterate through each cell to check if it's reserved
  times.forEach((time, rowIndex) => {
    desks.forEach((desk, colIndex) => {
      const cellValue = sheet.getRange(rowIndex + 2, colIndex + 2).getValue(); // +2 because of the offset (time starts from row 2, desk from column 2)
      
      if (cellValue.startsWith('xxx_')) { // Check if the cell value starts with 'xxx_'
        const [prefix, doctorName, visitorName] = cellValue.split('_'); // Split the cell value to extract doctor and visitor names
        reservations.push({ time: time, desk: desk, doctorName: doctorName, visitorName: visitorName });
      }
    });
  });

  return ContentService.createTextOutput(JSON.stringify(reservations)).setMimeType(ContentService.MimeType.JSON);
}
