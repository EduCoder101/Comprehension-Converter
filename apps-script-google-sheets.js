/**
 * Comprehension Hub – Google Apps Script for receiving test results
 *
 * INSTRUCTIONS:
 * 1. Open your Google Sheet (or create a new one).
 * 2. Go to Extensions → Apps Script.
 * 3. Delete any existing code and paste this entire file.
 * 4. Save (Ctrl+S).
 * 5. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web app URL and paste it into each test's Teacher Setup (or the Test Generator settings).
 *
 * Each test sends a "testName" in the payload. This script creates a separate TAB (sheet) per test
 * and appends student results to the correct tab. The Results Analyser uses doGet() to read all tabs.
 */

var CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

/** Respond to CORS preflight (OPTIONS) so Results Analyser can load data from another origin (e.g. GitHub Pages). */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(CORS_HEADERS);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var gotLock = lock.tryLock(10000);

  try {
    var raw = '';
    if (e && e.postData && e.postData.contents) {
      raw = e.postData.contents;
    }
    if (!raw && e && e.parameter && e.parameter.payload) {
      raw = e.parameter.payload;
    }

    if (!raw) {
      return jsonResponse({ status: 'error', message: 'No payload' });
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
      var correct = correctAnswers['q' + i] || '';
      if (writtenQs.indexOf(i) > -1) {
        row.push(ans ? 'See written' : '');
      } else {
        row.push(ans === correct ? '\u2713 ' + ans.toUpperCase() : '\u2717 ' + (ans ? ans.toUpperCase() : '-') + ' (' + (correct ? correct.toUpperCase() : '') + ')');
      }
    }

    for (var w = 0; w < writtenQs.length; w++) {
      row.push(answers['q' + writtenQs[w]] || '');
    }

    sheet.appendRow(row);
    return jsonResponse({ status: 'ok' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  } finally {
    if (gotLock) lock.releaseLock();
  }
}

/**
 * Used by the Results Analyser to load all test data (all tabs).
 * CORS headers allow loading when the hub is hosted on another domain (e.g. GitHub Pages).
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var result = { tests: [] };

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) continue;
    result.tests.push({
      name: sheet.getName(),
      headers: data[0],
      rows: data.slice(1)
    });
  }

  return jsonResponse(result);
}

function jsonResponse(obj) {
  var out = ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  if (out.setHeaders) out.setHeaders(CORS_HEADERS);
  return out;
}
