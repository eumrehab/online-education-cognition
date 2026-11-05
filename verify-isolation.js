const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const backend = fs.readFileSync(path.join(root, "google-apps-script.gs"), "utf8");
for (const source of [app, html, backend]) {
  assert(!/복지용구|welfare-course-|AKfycbxeczRU|1NgAiSK8ZDZWS/.test(source), "Existing course reference must not carry over");
}
assert(!fs.existsSync(path.join(root, "videos")), "Old videos must not be copied");
assert(!fs.existsSync(path.join(root, "exam-assets")), "Old exam images must not be copied");
assert(/const SPREADSHEET_ID = ""/.test(backend));
const storageAccess = [];
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, {
    classList: { toggle() {}, contains() { return true; } },
    addEventListener() {}, pause() {}, load() {}, removeAttribute() {},
    style: {}, textContent: "", innerHTML: "", disabled: false
  });
  return elements.get(id);
};
const context = vm.createContext({
  window: { scrollTo() {}, EXAM_QUESTIONS: [] },
  document: { getElementById: element, addEventListener() {}, querySelector: element, querySelectorAll() { return []; } },
  localStorage: {
    getItem(key) { storageAccess.push(key); assert(key.startsWith("cognition-edu-")); return null; },
    setItem(key) { assert(key.startsWith("cognition-edu-")); },
    removeItem(key) { assert(key.startsWith("cognition-edu-")); }
  },
  setInterval() {}, clearInterval() {}, setTimeout() {},
  fetch() { throw new Error("Unexpected network request"); },
  console
});
vm.runInContext(app, context);
(async () => {
  assert.equal(vm.runInContext("CONFIG.resultsEndpoint", context), "");
  assert.equal(vm.runInContext("CONFIG.lessons.length", context), 8);
  assert(vm.runInContext("CONFIG.lessons.every(lesson => lesson.src === '')", context));
  assert.equal(vm.runInContext("CONFIG.questions.length", context), 0);
  const login = await vm.runInContext("authenticateStudent({ studentId: '0000', name: '테스트' })", context);
  const admin = await vm.runInContext("authenticateAdmin({ adminId: 'test', password: 'test' })", context);
  assert.equal(login.ok, false);
  assert.equal(admin.ok, false);
  vm.runInContext("renderProgress(); loadLesson(0);", context);
  assert.equal(element("startExamBtn").disabled, true);
  assert(storageAccess.length > 0);
  console.log("PASS: independent storage, no production endpoint or spreadsheet, no videos/exam assets, logins fail closed, empty exam blocked, empty player loads.");
})().catch(error => { console.error(error); process.exitCode = 1; });
