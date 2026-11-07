const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const root = __dirname;
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const backend = fs.readFileSync(path.join(root, "google-apps-script.gs"), "utf8");
for (const source of [app, html, backend]) {
  assert(!/복지용구\s*상담사|welfare-course-|AKfycbxeczRU|1NgAiSK8ZDZWS/.test(source), "Existing course reference must not carry over");
}
for (let lesson = 1; lesson <= 8; lesson++) {
  const filename = `lesson-${String(lesson).padStart(2, "0")}.mp4`;
  assert(fs.statSync(path.join(root, "videos", filename)).size > 0, `Missing lesson video: ${filename}`);
}
assert(!fs.existsSync(path.join(root, "exam-assets")), "Old exam images must not be copied");
assert(/const SPREADSHEET_ID = "1s6XR3np6P_IQiJNm508K8llosgSXiInKU8hpQaIrYl8"/.test(backend));
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
  document: {
    getElementById: element, addEventListener() {}, querySelector: element, querySelectorAll() { return []; },
    createElement: element,
    head: { appendChild(script) { assert(script.src.startsWith('https://script.google.com/macros/s/AKfycby46I1tYKekRChxO90cKI1v_FT0YqblYQDC3gdyBcMla8J5XIrfVIfnCyAOmEEb0_x_4w/exec?')); } }
  },
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
  assert.equal(vm.runInContext("CONFIG.resultsEndpoint", context), "https://script.google.com/macros/s/AKfycby46I1tYKekRChxO90cKI1v_FT0YqblYQDC3gdyBcMla8J5XIrfVIfnCyAOmEEb0_x_4w/exec");
  assert.equal(vm.runInContext("CONFIG.lessons.length", context), 8);
  assert(vm.runInContext('CONFIG.lessons.every((lesson, i) => lesson.src === `./videos/lesson-${String(i + 1).padStart(2, "0")}.mp4`)', context));
  assert.equal(vm.runInContext("CONFIG.questions.length", context), 0);
  // 연동 설정이 누락되었을 때 임의 계정을 허용하지 않는지 별도로 검사합니다.
  vm.runInContext('CONFIG.resultsEndpoint = "";', context);
  const login = await vm.runInContext("authenticateStudent({ studentId: '0000', name: '테스트' })", context);
  const admin = await vm.runInContext("authenticateAdmin({ adminId: 'test', password: 'test' })", context);
  assert.equal(login.ok, false);
  assert.equal(admin.ok, false);
  vm.runInContext("renderProgress(); loadLesson(0);", context);
  assert.equal(element("startExamBtn").disabled, true);
  assert(storageAccess.length > 0);
  console.log("PASS: eight cognition lesson videos, isolated endpoint/spreadsheet/storage, no legacy exam assets, disabled integration fails closed, empty exam blocked.");
})().catch(error => { console.error(error); process.exitCode = 1; });
