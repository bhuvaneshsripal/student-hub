// ─────────────────────────────────────────────────────────────────────────
// DEVELOPER CONFIG — edit this in VS Code, not from inside the running app.
//
// This is the "Publish to web" CSV link of the Google Sheet that has exam
// dates by register number. It powers the "Exam Finder" page for everyone
// using the app, so it's set once here in code rather than as a setting a
// student can change.
//
// How to get the link:
//   1. Open your Google Sheet (columns: Register Number, Subject, Exam Date,
//      and optionally Session).
//   2. File → Share → Publish to web.
//   3. Under "Link", choose the exam-dates sheet/tab and select CSV as the
//      format, then click Publish.
//   4. Copy the generated link and paste it below between the quotes.
//   5. Save this file and rebuild/redeploy the app.
// ─────────────────────────────────────────────────────────────────────────

export const EXAM_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_AseyzjlBgoxH26bAetxC9I0kxFtDT7owVcNhrf9iLM1qlF7IVynlA_yWte5i03GVzmALgbie0U2s/pub?output=csv';
