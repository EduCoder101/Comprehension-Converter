# How to set up the Apps Script for the Results Analyser

Follow these steps exactly. You only need to do this once (or when you change the script).

---

## Do you use the Comprehension Test Generator?

**If yes:** You do **not** need to type questions into the spreadsheet. The script that comes with each generated test (the one you deploy from the Test Generator instructions) already saves the question text when the first student submits. The Results Analyser will then show those questions when you expand a row. Just deploy the script that the Test Generator gives you and use that Web app URL in the Results Analyser. You can skip the “Replace the code” step below unless you want a separate doGet-only script.

**If you don’t use the Test Generator** (e.g. you paste results from somewhere else), use the standalone script below and optionally add question text in Row 2 of each sheet (see “Your sheet layout”).

---

## 1. Open your Google Sheet

Open the spreadsheet that holds your comprehension test results (one sheet per test).

---

## 2. Open Apps Script

- In the menu, click **Extensions** → **Apps Script**.
- A new tab opens with a code editor. You might see a default file called `Code.gs` with a bit of sample code.

---

## 3. Replace the code with the script (if not using the Test Generator’s script)

- **Select all** the code in the editor (Ctrl+A, or Cmd+A on Mac).
- **Delete** it.
- Open the file **`AppsScript-ResultsFeed.gs`** from this project (in the Comprehension Converter folder).
- **Select all** that code (Ctrl+A) and **Copy** (Ctrl+C).
- Go back to the Apps Script tab and **Paste** (Ctrl+V) so the editor only contains that code.
- Click the **Save** (disk) icon or press Ctrl+S. Give the project a name if it asks (e.g. “Results Analyser Feed”).

---

## 4. Your sheet layout (each sheet = one test)

| Row | What goes here |
|-----|----------------|
| **Row 1** | Headers: e.g. `Student Name`, `Class`, `Score`, `Percentage`, `Q1`, `Q2`, `Q3`, … |
| **Row 2** | **If you use the Test Generator:** This row is filled in automatically with question text when the first student submits. **If you don’t:** Leave the first columns empty and put the question for Q1 in the Q1 column, Q2 in Q2, etc. (optional). |
| **Row 3 onwards** | One row per student (names, class, score, percentage, and their answer for each Q). |

---

## 5. Deploy as a Web app

- In Apps Script, click **Deploy** → **New deployment**.
- Next to “Select type”, click the **gear icon** and choose **Web app**.
- Fill in:
  - **Description:** e.g. “Results Analyser” (anything you like).
  - **Execute as:** **Me** (your Google account).
  - **Who has access:** **Anyone** (so the Results Analyser page can load the data).
- Click **Deploy**.
- The first time, Google will ask you to **Authorise access**: click your account, then **Allow**.
- You’ll see a **Web app** URL (something like `https://script.google.com/macros/s/.../exec`). Click **Copy** to copy it.

---

## 6. Use the URL in the Results Analyser

- Open your Results Analyser page (the HTML you uploaded to GitHub, or the one you run locally).
- Click the **Settings** (gear) button.
- Paste the Web app URL into the **Web App URL** box.
- Click **Load Results**.

Your tests should appear. When you go to **Test Analysis** and click a row in the **Question Difficulty** table, it will expand and show the question text from Row 2 of that sheet.

---

## Optional: Ignore certain sheets

The script skips any sheet whose name:

- Starts with an underscore (e.g. `_Instructions`), or  
- Is exactly `Instructions`, or  
- Is exactly `Key`.

So you can keep instructions or a key in the same workbook; name that sheet `_Instructions` or `Instructions` and it won’t appear as a test. If you want **every** sheet to be a test, open the script and delete these three lines (they appear together near the start of `getResultsData`):

```javascript
if (name.indexOf('_') === 0) continue;
if (name.toLowerCase() === 'instructions') continue;
if (name.toLowerCase() === 'key') continue;
```

---

## If something goes wrong

- **“Invalid data format”** – Make sure you copied the **entire** script and that each sheet has at least Row 1 (headers) and Row 2 (question text or blank), and that Row 1 includes columns like `Q1`, `Q2`, etc.
- **No question text when I expand** – Check that **Row 2** on that sheet has the question text in the **same column** as the Q (e.g. question for Q1 in the Q1 column).
- **URL doesn’t load** – After you change the script, use **Deploy** → **Manage deployments** → **Edit** (pencil) on your deployment → set **Version** to **New version** → **Deploy**, then use the **same** URL again in the Results Analyser.
