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
 *
 * This file includes both:
 *   doGet(e) – returns all sheet data for the Results Analyser.
 *   doPost(e) – receives student test submissions and appends a row to the correct sheet (creates the sheet/tab if it doesn't exist).
 */

/**
 * Receives student results from a test and appends a row to the sheet tab for that test.
 * Tab name is taken from payload.testName (e.g. "asdas — 5A"). Creates the tab if it doesn't exist.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var gotLock = lock.tryLock(10000);

  try {
    var raw = '';
    if (e && e.postData && e.postData.contents) raw = e.postData.contents;
    if (!raw && e && e.parameter && e.parameter.payload) raw = e.parameter.payload;

    if (!raw) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Tab name: use testName, sanitise for Google Sheets (max 100 chars; no \ / ? * [ ])
    var tabName = String(data.testName || 'General')
      .replace(/[\\\/\?\*\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
    if (!tabName) tabName = 'General';

    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }

    var totalQ = data.totalQuestions || 38;
    var writtenQs = data.writtenQuestions || [];

    if (sheet.getLastRow() === 0) {
      var headers = ['Timestamp', 'Student Name', 'Class', 'Score', 'Percentage', 'Total Questions'];
      for (var i = 1; i <= totalQ; i++) {
        headers.push('Q' + i);
      }
      for (var w = 0; w < writtenQs.length; w++) {
        headers.push('Q' + writtenQs[w] + ' Written Response');
      }
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
      // Optional: write question text row for Results Analyser
      if (data.questionTexts && typeof data.questionTexts === 'object') {
        var row2 = [];
        for (var c = 0; c < headers.length; c++) {
          var h = headers[c];
          row2.push(data.questionTexts[h] || '');
        }
        sheet.appendRow(row2);
      }
    }

    var answers = data.answers || {};
    var correctAnswers = data.correctAnswers || {};

    var row = [
      new Date().toLocaleString('en-AU'),
      data.studentName || '',
      data.studentClass || '',
      data.score || 0,
      data.percentage || '0%',
      totalQ
    ];

    for (var i = 1; i <= totalQ; i++) {
      var ans = answers['q' + i] || '';
      var correct = (correctAnswers['q' + i] || '').toUpperCase();
      if (writtenQs.indexOf(i) > -1) {
        row.push(ans ? 'See written' : '');
      } else {
        row.push(ans === correct ? '\u2713 ' + (ans ? ans.toUpperCase() : '') : '\u2717 ' + (ans ? ans.toUpperCase() : '\u2014') + ' (' + correct + ')');
      }
    }

    for (var w = 0; w < writtenQs.length; w++) {
      row.push(answers['q' + writtenQs[w]] || '');
    }

    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (gotLock) lock.releaseLock();
  }
}

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
