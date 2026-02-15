/**
 * RESULTS ANALYSER – GOOGLE APPS SCRIPT (standalone)
 * Use this only if you are NOT using the script that comes inside the Test Generator.
 *
 * If you create tests with the Comprehension Test Generator and use the script
 * it gives you (in the test HTML / deploy instructions), that script already
 * writes question text to row 2 and returns it – no need to type questions in the sheet.
 *
 * SPREADSHEET LAYOUT (each sheet = one test):
 *   Row 1: Headers (Student Name, Class, Score, Percentage, Q1, Q2, ...)
 *   Row 2: Question text (optional) – empty in non-Q columns; Q1, Q2... columns hold the question text
 *   Row 3+: Student results
 */

function doGet(e) {
  var result = getResultsData();
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Builds the data object that the Results Analyser expects.
 * Loops through every sheet in the spreadsheet (each sheet = one test).
 */
function getResultsData() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var tests = [];

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var name = sheet.getName();

    // Skip hidden or helper sheets (optional – delete the next 3 lines if you want every sheet included)
    if (name.indexOf('_') === 0) continue;
    if (name.toLowerCase() === 'instructions') continue;
    if (name.toLowerCase() === 'key') continue;

    var test = buildOneTest(sheet);
    if (test) tests.push(test);
  }

  return { tests: tests };
}

/**
 * Reads one sheet and returns one test object: name, headers, rows, questionTexts.
 * Row 1 = headers. If row 2 has no date in the first cell, it is treated as question text; then row 3+ = students. Otherwise row 2+ = students.
 */
function buildOneTest(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 1 || lastCol < 1) return null;

  var allRows = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = allRows[0];
  var hasQuestionRow = lastRow >= 2 && (allRows[1][0] === '' || allRows[1][0] === null || allRows[1][0] === undefined || !/^\d{1,2}[\/\-]\d{1,2}/.test(String(allRows[1][0])));
  var questionRow = hasQuestionRow ? allRows[1] : [];
  var dataRows = hasQuestionRow ? allRows.slice(2) : allRows.slice(1);

  // Build questionTexts from row 2: only for columns whose header is Q1, Q2, Q3, etc.
  var questionTexts = {};
  for (var c = 0; c < headers.length; c++) {
    var header = String(headers[c] || '').trim();
    if (/^Q\d+$/i.test(header)) {
      var text = questionRow[c];
      if (text !== null && text !== undefined && String(text).trim() !== '') {
        questionTexts[header] = String(text).trim();
      }
    }
  }

  return {
    name: sheet.getName(),
    headers: headers.map(function(cell) { return String(cell == null ? '' : cell); }),
    rows: dataRows,
    questionTexts: questionTexts
  };
}
