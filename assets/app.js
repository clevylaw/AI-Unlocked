/* AI for Legal Work: the script shared by every page.
   Progress is kept in this browser's localStorage under the same keys and formats the site has always used,
   so returning learners keep their lessons, path and certificates:
     ailearn_progress_v2   { "3_1": true | "known" }   module id _ lesson index (0-based)
     ailearn_path_v1       { id, answers, time }
     ailearn_certs_v1      [ { id, kind, pathId?, title, date, lessons, known, brand? } ]  brand is new; older certificates show the old name
     ailearn_certname_v1   "Name on the certificate"
     ailearn_rate          read-aloud speed
     ailearn_voice_v1      read-aloud voice ("recorded" or a device voice name)  (new) */
(function () {
  "use strict";
  const C = window.COURSE, MODULES = C.modules, PATHS = C.paths, QUESTIONS = C.questions;
  const body = document.body, PAGE = body.dataset.page, ROOT = body.dataset.root || "./";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>', ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    play: '<path d="m6 3 14 9-14 9z"/>', pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>', speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'
  };
  const icon = (n, cls = "ico-sm") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
  const lessonUrl = r => { const { l } = ref(r); return `${ROOT}lessons/${l.slug}/`; };
  const fmtDate = d => { const t = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d + "T12:00:00" : d); return isNaN(t) ? null : new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); };

  // ---------- Saved state (this browser only) ----------
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
  const store = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let progress = load("ailearn_progress_v2", {});
  if (!progress || typeof progress !== "object" || Array.isArray(progress)) progress = {};
  let myPath = load("ailearn_path_v1", null);
  if (myPath && !PATHS[myPath.id]) myPath = null;
  let certs = load("ailearn_certs_v1", []);
  if (!Array.isArray(certs)) certs = [];
  let certName = load("ailearn_certname_v1", "") || "";
  function save() {
    award();
    store("ailearn_progress_v2", progress); store("ailearn_path_v1", myPath);
    store("ailearn_certs_v1", certs); store("ailearn_certname_v1", certName || null);
    store("ailearn_updated_v1", Date.now());
  }
  const key = (mid, i) => `${mid}_${i}`;
  function ref(r) { const [mid, n] = r.split("-").map(Number); const m = MODULES.find(x => x.id === mid); return { m, i: n - 1, l: m.lessons[n - 1] }; }
  const isDone = r => { const { m, i } = ref(r); return !!progress[key(m.id, i)]; };
  const isKnown = r => { const { m, i } = ref(r); return progress[key(m.id, i)] === "known"; };
  const ALL = MODULES.flatMap(m => m.lessons.map((_, i) => `${m.id}-${i + 1}`));
  const newCertId = () => "AIU-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  function award() {
    const today = new Date().toISOString().slice(0, 10);
    if (myPath) {
      const p = PATHS[myPath.id];
      if (p.steps.every(isDone) && !certs.some(c => c.kind === "path" && c.pathId === myPath.id))
        certs.push({ id: newCertId(), brand: "AI for Legal Work", kind: "path", pathId: myPath.id, title: p.name, date: today, lessons: p.steps.length, known: p.steps.filter(isKnown).length });
    }
    if (ALL.every(isDone) && !certs.some(c => c.kind === "course"))
      certs.push({ id: newCertId(), brand: "AI for Legal Work", kind: "course", title: "The complete AI for Legal Work course", date: today, lessons: ALL.length, known: ALL.filter(isKnown).length });
  }
    function choosePath(a) {
    // Paths for the legal course: starter = new to AI, everyday = law students, work = legal practice, builder = legal tech.
    const [use, tech, goal] = a;
    if (goal === 3 || tech === 3) return "builder";
    if (goal === 2) return "work";
    if (goal === 1) return "everyday";
    return "starter";
  }
  const nextStepIndex = p => p.steps.findIndex(r => !isDone(r));
  const firstUnfinished = () => ALL.find(r => !isDone(r)) || null;
  const started = () => Object.keys(progress).length > 0;
  const techReader = () => !!myPath && (myPath.id === "builder" || (myPath.answers || [])[1] >= 2);
  function shuffled(n) { const a = [...Array(n).keys()]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ---------- Menu, Start over ----------
  const menuBtn = $("#menu-btn"), nav = $("#site-nav");
  function closeMenu(focus) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); if (focus) menuBtn.focus(); }
  menuBtn.addEventListener("click", () => { const open = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(open)); if (open) $("a", nav).focus(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) closeMenu(true); });
  document.addEventListener("click", e => { if (nav.classList.contains("open") && !e.target.closest(".header-inner")) closeMenu(false); });
  document.addEventListener("click", e => {
    if (e.target.closest("[data-reset]")) { $("#reset-confirm").hidden = false; $("#reset-yes").focus(); return; }
    if (e.target.closest("#reset-no")) { $("#reset-confirm").hidden = true; $("[data-reset]").focus(); return; }
    if (e.target.closest("#reset-yes")) {
      progress = {}; myPath = null; save();
      $("#reset-confirm").hidden = true; $("#reset-done").hidden = false; $("[data-reset]").focus();
      setTimeout(() => location.reload(), 1200);
    }
  });

  // ---------- Quizzes (lesson pages and module reviews) ----------
  $$("[data-shuffle] .quiz-options").forEach(box => {
    const opts = [...box.children], order = shuffled(opts.length);
    order.forEach((o, pos) => { const b = opts[o]; $(".opt-letter", b).textContent = String.fromCharCode(65 + pos); box.appendChild(b); });
  });
  // A wrong first answer gets a second try; the right answer and explanation appear after a right answer or a second miss.
  document.addEventListener("click", e => {
    const b = e.target.closest(".quiz-opt"); if (!b || b.disabled) return;
    const block = b.closest(".quiz-block"); if (block.dataset.answered) return;
    const correct = +block.dataset.correct, chosen = +b.dataset.opt, right = chosen === correct;
    const tries = (+block.dataset.tries || 0) + 1; block.dataset.tries = tries;
    if (tries === 1) block.dataset.result = right ? "right" : "wrong";
    const fb = $(".quiz-feedback", block), label = o => o.innerText.split("\n").pop();
    if (!right && tries < 2) {
      b.disabled = true; b.classList.add("wrong"); b.setAttribute("aria-label", `${label(b)} (not this one)`);
      fb.textContent = "Not quite. Try another answer."; fb.className = "quiz-feedback bad";
      return;
    }
    block.dataset.answered = "1";
    let letter = "";
    $$(".quiz-opt", block).forEach(o => {
      o.disabled = true;
      if (+o.dataset.opt === correct) { o.classList.add("correct"); o.setAttribute("aria-label", `${label(o)} (the right answer)`); letter = $(".opt-letter", o).textContent; }
      else if (o === b) { o.classList.add("wrong"); o.setAttribute("aria-label", `${label(o)} (your answer)`); }
    });
    fb.textContent = (right ? (tries === 1 ? "Right. " : "Right, on your second try. ") : `Not quite. The answer is ${letter}. `) + fb.dataset.feedback;
    fb.className = `quiz-feedback ${right ? "ok" : "bad"}`;
    const review = block.closest("[data-review]");
    if (review) {
      const blocks = $$(".quiz-block", review), done = blocks.filter(x => x.dataset.answered);
      if (done.length === blocks.length) {
        const n = blocks.filter(x => x.dataset.result === "right").length;
        $(".review-score", review).textContent = n === blocks.length ? `${n} of ${n} right on the first try. You know this module well.` : `${n} of ${blocks.length} right on the first try. Look back at the lessons for the ones you missed, then carry on.`;
      }
    }
  });

  // ---------- Print ----------
  document.addEventListener("click", e => { if (e.target.closest("[data-print]")) window.print(); });
  addEventListener("beforeprint", () => { $$("details").forEach(d => { if (!d.open) { d.dataset.printOpened = "1"; d.open = true; } }); });
  addEventListener("afterprint", () => { $$("details[data-print-opened]").forEach(d => { d.open = false; d.removeAttribute("data-print-opened"); }); });

  // ---------- Copy buttons ----------
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const el = $(b.dataset.copy), label = $("span", b), old = label.textContent;
    try { await navigator.clipboard.writeText(el.textContent); label.textContent = "Copied"; }
    catch (err) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = "Selected. Press Ctrl+C or ⌘C to copy."; }
    setTimeout(() => { label.textContent = old; }, 2500);
  });

  // ---------- Progress marks on lesson lists and module cards ----------
  function markLists() {
    $$("[data-lesson-ref]").forEach(a => {
      const d = isDone(a.dataset.lessonRef), num = $(".lesson-num", a), n = a.dataset.lessonRef.split("-")[1];
      a.classList.toggle("is-done", d);
      num.innerHTML = d ? icon("check") + `<span class="sr-only">Done: </span>` : n;
    });
    $$(".module-card[data-module]").forEach(card => {
      const m = MODULES.find(x => x.id === +card.dataset.module), done = m.lessons.filter((_, i) => progress[key(m.id, i)]).length;
      $(".bar span", card).style.width = `${(done / m.lessons.length) * 100}%`;
      $(".module-progress", card).textContent = done ? `${done} of ${m.lessons.length} done` : "";
      $(".done-pill", card).hidden = done !== m.lessons.length;
    });
    $$("[data-module-progress]").forEach(el => {
      const m = MODULES.find(x => x.id === +el.dataset.moduleProgress), done = m.lessons.filter((_, i) => progress[key(m.id, i)]).length;
      el.textContent = done ? `${done} of ${m.lessons.length} done` : "";
    });
  }
  markLists();

  // ---------- Home ----------
  if (PAGE === "home") {
    // Old single-page links (#path, #tools...) go to their new pages.
    const old = { "#path": "path/", "#modules": "lessons/", "#tools": "tools/", "#models": "models/", "#glossary": "glossary/" }[location.hash];
    if (old) location.replace(ROOT + old);
    const act = $("#home-action"), sub = $("#home-sub");
    if (myPath) {
      const p = PATHS[myPath.id], nx = nextStepIndex(p);
      if (nx === -1) { act.innerHTML = `<a class="btn-hero" href="${ROOT}path/">See your path and certificate →</a>`; sub.innerHTML = `Or browse <a href="${ROOT}lessons/">all lessons</a>.`; }
      else { act.innerHTML = `<a class="btn-hero" href="${lessonUrl(p.steps[nx])}">Continue: ${esc(ref(p.steps[nx]).l.title)} →</a>`; sub.innerHTML = `Your path is ${esc(p.name)}. <a href="${ROOT}path/">See your path</a>.`; }
    } else if (started() && firstUnfinished()) {
      const r = firstUnfinished();
      act.innerHTML = `<a class="btn-hero" href="${lessonUrl(r)}">Continue: ${esc(ref(r).l.title)} →</a>`;
      sub.innerHTML = `Or <a href="${ROOT}path/">answer 4 questions</a> to get a path that fits you.`;
    }
  }

  // ---------- Lessons map ----------
  if (PAGE === "lessons" && $("#lessons-action")) {
    const box = $("#lessons-action");
    let r = null;
    if (myPath) { const p = PATHS[myPath.id], nx = nextStepIndex(p); if (nx !== -1) r = p.steps[nx]; }
    else if (started()) r = firstUnfinished();
    box.innerHTML = r ? `<a class="btn-main" href="${lessonUrl(r)}">Continue: ${esc(ref(r).l.title)} →</a>` : (started() ? "" : `<a class="btn-main" href="${lessonUrl(ALL[0])}">Start with lesson 1 →</a>`);
    if (!box.innerHTML) box.remove();
  }

  // ---------- Module page ----------
  const modAction = $("#module-action");
  if (modAction) {
    const m = MODULES.find(x => x.id === +modAction.dataset.module);
    const refs = m.lessons.map((_, i) => `${m.id}-${i + 1}`), done = refs.filter(isDone).length, nx = refs.find(r => !isDone(r));
    if (done === refs.length) { modAction.href = `${ROOT}modules/${m.slug}/review/`; modAction.textContent = "Review this module →"; }
    else if (done) { modAction.href = lessonUrl(nx); modAction.textContent = `Continue: ${ref(nx).l.title} →`; }
  }

  // ---------- Your path ----------
  const pathBox = $("#path-box");
  const quiz = { active: !myPath, step: 0, answers: [] };
  const placement = { active: false, items: [], idx: 0, right: [] };
  function focusEl(sel) { const el = $(sel); if (el) el.focus({ preventScroll: false }); }
  function pathReason(p) {
    const a = p.answers || []; if (a.length < 3) return "";
    const parts = [0, 1, 2].map(n => QUESTIONS[n].phrase[a[n]]);
    return `You said you ${parts[0]}, ${parts[1]}, and want to ${parts[2]}.`;
  }
  function dots(n, k) { return `<div class="pq-dots" aria-hidden="true">${Array.from({ length: n }, (_, j) => `<span class="${j < k ? "done" : j === k ? "now" : ""}"></span>`).join("")}</div>`; }
  function renderQuiz() {
    const q = QUESTIONS[quiz.step], n = QUESTIONS.length;
    pathBox.innerHTML = `<div class="pq">
      <div class="pq-top"><span class="eyebrow">Find your path</span><span class="pq-count">Question ${quiz.step + 1} of ${n}</span></div>${dots(n, quiz.step)}
      <h2 id="pq-q" tabindex="-1">${esc(q.q)}</h2>
      ${quiz.step === 0 ? '<p class="pq-help">This takes about a minute. Pick the answer closest to you. You can change it later.</p>' : ""}
      <div class="pq-opts" role="group" aria-labelledby="pq-q">${q.opts.map((o, k) => `<button class="pq-opt" type="button" aria-pressed="${quiz.answers[quiz.step] === k}" data-ans="${k}">${esc(o)}</button>`).join("")}</div>
      <div class="pq-actions">
        ${quiz.step > 0 ? '<button class="btn-secondary" type="button" data-quiz-back>← Back</button>' : (!myPath ? '<button class="link-btn" type="button" data-skip-quiz>Skip the questions and use the beginner path</button>' : "<span></span>")}
        ${myPath ? '<button class="link-btn" type="button" data-quiz-cancel>Keep my current path</button>' : ""}
      </div></div>`;
  }
  function renderPath() {
    if (placement.active) return renderPlacement();
    if (quiz.active || !myPath) { quiz.active = true; return renderQuiz(); }
    const p = PATHS[myPath.id], steps = p.steps;
    const done = steps.filter(isDone).length, total = steps.reduce((s, r) => s + ref(r).l.time, 0);
    const per = myPath.time || 20, sittings = Math.max(1, Math.ceil(total / per));
    const nx = nextStepIndex(p), knownN = steps.filter(isKnown).length, left = steps.length - done;
    const others = Object.keys(PATHS).filter(k => k !== myPath.id);
    const cert = certs.find(c => c.kind === "path" && c.pathId === myPath.id);
    const unread = ALL.filter(r => !steps.includes(r) && !isDone(r)).slice(0, 5);
    pathBox.innerHTML = `<div class="path-view">
      <div class="path-head">
        <span class="eyebrow">Your path</span>
        <h2 id="path-title" tabindex="-1">${esc(p.name)}</h2>
        <p>${esc(p.summary)}</p>
        ${pathReason(myPath) ? `<p class="path-why">${esc(pathReason(myPath))}</p>` : ""}
        <p class="path-stats">${steps.length} lessons, about ${total} minutes in all. That is about ${sittings} sitting${sittings > 1 ? "s" : ""} of ${per} minutes.</p>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${done}" aria-label="Lessons done in your path"><span style="width:${(done / steps.length) * 100}%"></span></div>
        <p class="path-done-text">${done} of ${steps.length} done${knownN ? `, including ${knownN} you already knew` : ""}</p>
        ${nx === -1
          ? `<p class="path-complete">${icon("check")} You finished this path.</p>
             ${cert ? `<a class="btn-main" href="${ROOT}certificate/#${esc(cert.id)}">See your certificate →</a>` : ""}
             ${unread.length ? `<p style="margin-top:14px">Lessons you haven't read yet:</p><ul>${unread.map(r => `<li><a href="${lessonUrl(r)}">${esc(ref(r).l.title)}</a></li>`).join("")}</ul>` : ""}`
          : `<a class="btn-main" href="${lessonUrl(steps[nx])}">${done === 0 ? "Start" : "Continue"}: ${esc(ref(steps[nx]).l.title)} →</a>
             ${left >= 2 ? `<div class="side-box"><p><strong>Already know some of this?</strong> Take a ${left}-question placement check. It takes about ${Math.max(1, Math.round(left * 0.4))} minutes. Lessons you answer correctly are marked as known, so you can skip them.</p><button class="btn-secondary" type="button" data-placement-start>Take the placement check</button></div>` : ""}`}
        ${knownN ? `<p class="muted" style="margin-top:12px"><button class="link-btn" type="button" data-unknown>Undo the placement check</button> to put the lessons you skipped back in your path.</p>` : ""}
      </div>
      <ol class="path-steps" aria-label="Lessons in your path">${steps.map((r, k) => { const { m, l } = ref(r), d = isDone(r); return `<li><a class="path-step c-${m.color}${d ? " is-done" : ""}${k === nx ? " next" : ""}" href="${lessonUrl(r)}">
        <span class="ps-num">${d ? icon("check") + '<span class="sr-only">Done: </span>' : k + 1}</span>
        <span class="ps-text"><strong>${esc(l.title)}</strong><span>Module ${m.id}: ${esc(m.title)} · ${l.time} min${k === nx ? " · Up next" : ""}${isKnown(r) ? " · You already knew this" : ""}</span></span></a></li>`; }).join("")}</ol>
      <div class="path-switch">
        <p>Not quite right? <button class="link-btn" type="button" data-retake>Answer the questions again</button>, or switch to another path.</p>
        <div class="chips">${others.map(k => `<button class="chip" type="button" data-switch-path="${k}">${esc(PATHS[k].name)}</button>`).join("")}</div>
        <p class="muted">Lessons outside your path are always on the <a href="${ROOT}lessons/">Lessons</a> page.</p>
      </div>
      ${certs.length ? `<div class="certs-list"><h2>Your certificates</h2>${certs.map(c => `<a class="cert-item" href="${ROOT}certificate/#${esc(c.id)}"><span class="cert-seal" aria-hidden="true">AI</span><span class="ps-text"><strong>${esc(c.title)}</strong><span>Earned ${esc(fmtDate(c.date) || c.date)}</span></span></a>`).join("")}</div>` : ""}
    </div>`;
  }
  function renderPlacement() {
    const n = placement.items.length, k = placement.idx;
    if (k >= n) return renderPlacementResult();
    const { m, l } = ref(placement.items[k]), q = l.quiz, order = shuffled(q.opts.length);
    pathBox.innerHTML = `<div class="pq">
      <div class="pq-top"><span class="eyebrow">Placement check</span><span class="pq-count">Question ${k + 1} of ${n}</span></div>${dots(n, k)}
      <p class="pl-topic">From the lesson “${esc(l.title)}” in module ${m.id}</p>
      <h2 id="pl-q" tabindex="-1">${esc(q.q)}</h2>
      <div class="pq-opts one-col" role="group" aria-labelledby="pl-q">${order.map(o => `<button class="pq-opt" type="button" data-pl-ans="${o}">${esc(q.opts[o])}</button>`).join("")}
        <button class="pq-opt unsure" type="button" data-pl-ans="-1">I'm not sure</button></div>
      <div class="pq-actions"><span class="muted">You only skip lessons you answer correctly, so there's no point guessing.</span><button class="link-btn" type="button" data-pl-cancel>Stop the check</button></div>
    </div>`;
  }
  function renderPlacementResult() {
    const got = placement.items.filter((_, j) => placement.right[j]);
    got.forEach(r => { const { m, i } = ref(r); if (!progress[key(m.id, i)]) progress[key(m.id, i)] = "known"; });
    placement.active = false; save();
    const left = PATHS[myPath.id].steps.filter(r => !isDone(r)).length;
    pathBox.innerHTML = `<div class="pq">
      <span class="eyebrow">Placement check results</span>
      <h2 id="pl-q" tabindex="-1">You already know ${got.length} of ${placement.items.length} lessons</h2>
      <p style="margin:10px 0 14px;color:var(--ink2)">${got.length ? "Those lessons are marked as known, so your path skips them. You can still open them at any time." : "No lessons were skipped, so your path stays the same. That means the lessons should be useful to you."} ${left ? `You have ${left} lesson${left > 1 ? "s" : ""} left.` : "That completes your path."}</p>
      ${got.length ? `<ul class="pl-known">${got.map(r => `<li>${icon("check")} ${esc(ref(r).l.title)}</li>`).join("")}</ul>` : ""}
      <div class="pq-actions"><button class="btn-main" type="button" data-pl-done>See my updated path →</button></div>
    </div>`;
    focusEl("#pl-q");
  }
  if (pathBox) {
    const introEl = $(".page-intro");
    const setIntro = () => { if (introEl) introEl.textContent = myPath && !quiz.active ? "The lessons chosen for you, in order, with your progress." : "Answer 4 short questions. We'll choose the lessons that fit you and put them in order."; };
    new MutationObserver(setIntro).observe(pathBox, { childList: true });
    if (location.hash === "#questions" && myPath) quiz.active = true;
    renderPath();
    pathBox.addEventListener("click", e => {
      const t = e.target;
      const ans = t.closest("[data-ans]");
      if (ans) {
        quiz.answers[quiz.step] = +ans.dataset.ans;
        if (quiz.step < QUESTIONS.length - 1) { quiz.step++; renderQuiz(); focusEl("#pq-q"); }
        else { const a = quiz.answers; myPath = { id: choosePath(a), answers: a.slice(0, 3), time: QUESTIONS[3].minutes[a[3]] ?? 20 }; quiz.active = false; save(); renderPath(); focusEl("#path-title"); }
        return;
      }
      if (t.closest("[data-quiz-back]")) { quiz.step = Math.max(0, quiz.step - 1); renderQuiz(); focusEl("#pq-q"); return; }
      if (t.closest("[data-skip-quiz]")) { myPath = { id: "starter", answers: [], time: 20 }; quiz.active = false; save(); renderPath(); focusEl("#path-title"); return; }
      if (t.closest("[data-quiz-cancel]")) { quiz.active = false; renderPath(); focusEl("#path-title"); return; }
      if (t.closest("[data-retake]")) { quiz.active = true; quiz.step = 0; quiz.answers = []; renderQuiz(); focusEl("#pq-q"); return; }
      const sw = t.closest("[data-switch-path]");
      if (sw) { myPath = { ...myPath, id: sw.dataset.switchPath, answers: [] }; save(); renderPath(); focusEl("#path-title"); return; }
      if (t.closest("[data-placement-start]")) { placement.items = PATHS[myPath.id].steps.filter(r => !isDone(r)); placement.idx = 0; placement.right = []; placement.active = true; renderPlacement(); focusEl("#pl-q"); return; }
      const pl = t.closest("[data-pl-ans]");
      if (pl) { const { l } = ref(placement.items[placement.idx]); placement.right[placement.idx] = +pl.dataset.plAns === l.quiz.correct; placement.idx++; renderPlacement(); focusEl("#pl-q"); return; }
      if (t.closest("[data-pl-cancel]")) {
        if (!placement.idx) { placement.active = false; renderPath(); focusEl("#path-title"); return; }
        placement.items = placement.items.slice(0, placement.idx); renderPlacementResult(); return;
      }
      if (t.closest("[data-pl-done]")) { renderPath(); focusEl("#path-title"); return; }
      if (t.closest("[data-unknown]")) {
        PATHS[myPath.id].steps.forEach(r => { const { m, i } = ref(r); if (progress[key(m.id, i)] === "known") delete progress[key(m.id, i)]; });
        save(); renderPath(); focusEl("#path-title");
      }
    });
  }

  // ---------- Certificate ----------
  const certBox = $("#cert-box");
  if (certBox) {
    const id = decodeURIComponent(location.hash.slice(1)), c = certs.find(x => x.id === id);
    if (!c) {
      certBox.innerHTML = `<p style="margin-bottom:16px">No certificate was found in this browser${id ? ` with the number ${esc(id)}` : ""}. Certificates are saved in the browser where you earned them.</p><a class="btn-main" href="${ROOT}path/">Go to your path →</a>`;
    } else {
      certBox.innerHTML = `<div class="cert-form"><label for="cert-name">Your name</label><input id="cert-name" type="text" maxlength="60" autocomplete="name" placeholder="Your full name" value="${esc(certName)}"></div>
        <figure class="cert-figure"><img id="cert-img" alt="Certificate of completion"></figure>
        <div class="cert-actions"><button class="btn-main" type="button" id="cert-save">Save the certificate (PNG picture)</button><p class="cert-note" id="cert-note" role="status"></p></div>`;
      let canvas = null, draw = 0, timer = null;
      const render = async () => {
        const token = ++draw, cv = await drawCert(c, certName || "");
        if (token !== draw) return;
        canvas = cv;
        $("#cert-img").src = cv.toDataURL("image/png");
        $("#cert-img").alt = `Certificate of completion for ${certName.trim() || "you"}: ${c.title}, ${fmtDate(c.date) || c.date}, certificate number ${c.id}`;
        $("#cert-save").disabled = !certName.trim();
        $("#cert-note").textContent = certName.trim() ? "" : "Add your name to save the certificate.";
      };
      $("#cert-name").addEventListener("input", e => { certName = e.target.value.slice(0, 60); clearTimeout(timer); timer = setTimeout(() => { save(); render(); }, 300); });
      $("#cert-save").addEventListener("click", async () => {
        if (!certName.trim() || !canvas) return;
        const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = `AI for Legal Work certificate - ${certName.trim()}.png`.replace(/[\\/:*?"<>|]/g, ""); a.hidden = true;
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
        $("#cert-note").textContent = "Saved. Look in your Downloads folder.";
      });
      render();
    }
  }
  async function drawCert(c, name) {
    try { await Promise.all(['600 80px "EB Garamond"', 'italic 500 50px "EB Garamond"', '400 28px Literata', 'italic 400 28px Literata', '700 24px Literata'].map(f => document.fonts.load(f))); } catch (e) {}
    const W = 1600, H = 1131, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), LS = "letterSpacing" in g;
    const plum = "#2a1030", berry = "#9c1f5a", ink = "#22181f", soft = "#6d6070", pink = "#ffb3cd";
    g.fillStyle = "#fffafc"; g.fillRect(0, 0, W, H);
    g.strokeStyle = plum; g.lineWidth = 18; g.strokeRect(36, 36, W - 72, H - 72);
    g.strokeStyle = berry; g.lineWidth = 2; g.strokeRect(70, 70, W - 140, H - 140);
    g.fillStyle = berry;
    for (const [x, y] of [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]]) { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillRect(-9, -9, 18, 18); g.restore(); }
    g.textAlign = "center";
    const line = (s, font, color, y, sp) => { g.font = font; g.fillStyle = color; if (LS) g.letterSpacing = sp || "0px"; g.fillText(s, W / 2, y); if (LS) g.letterSpacing = "0px"; };
    const fit = (s, base, min, max, style) => { let z = base; g.font = style(z); while (g.measureText(s).width > max && z > min) { z -= 2; g.font = style(z); } return g.font; };
    line((c.brand || "AI Unlocked").toUpperCase(), '700 26px Literata, Georgia, serif', berry, 180, "8px");
    line("Certificate of Completion", '600 92px "EB Garamond", Georgia, serif', plum, 300);
    line("This certifies that", 'italic 400 30px Literata, Georgia, serif', soft, 390);
    const shown = name.trim() || "Your name";
    line(shown, fit(shown, 104, 44, 1150, z => `600 ${z}px "EB Garamond", Georgia, serif`), name.trim() ? ink : "#b8adb6", 510);
    g.strokeStyle = berry; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 420, 548); g.lineTo(W / 2 + 420, 548); g.stroke();
    line(c.kind === "course" ? "has completed" : "has completed the learning path", 'italic 400 30px Literata, Georgia, serif', soft, 622);
    line(c.title, fit(c.title, 62, 34, 1200, z => `italic 500 ${z}px "EB Garamond", Georgia, serif`), berry, 708);
    line(`${c.lessons} lessons${c.known ? `, including ${c.known} passed by placement check` : ""}`, '400 28px Literata, Georgia, serif', soft, 772);
    g.fillStyle = plum; g.beginPath(); g.arc(W / 2, 905, 70, 0, Math.PI * 2); g.fill();
    g.strokeStyle = pink; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, 905, 58, 0, Math.PI * 2); g.stroke();
    line("AI", '600 56px "EB Garamond", Georgia, serif', pink, 924);
    g.fillStyle = soft; g.font = '700 20px Literata, Georgia, serif'; if (LS) g.letterSpacing = "3px";
    g.textAlign = "left"; g.fillText("DATE", 200, 915);
    g.textAlign = "right"; g.fillText("CERTIFICATE ID", W - 200, 915); if (LS) g.letterSpacing = "0px";
    g.fillStyle = ink; g.font = '400 30px Literata, Georgia, serif';
    g.textAlign = "left"; g.fillText(fmtDate(c.date) || c.date, 200, 960);
    g.textAlign = "right"; g.fillText(c.id, W - 200, 960);
    return cv;
  }

  // ---------- Lesson page ----------
  if (body.dataset.ref) {
    const r = body.dataset.ref, { m, i, l } = ref(r);
    const inPath = myPath && PATHS[myPath.id].steps.includes(r);
    const doneBtn = $("#done-btn"), strip = $("#path-strip");
    let target = doneBtn.getAttribute("href");
    if (inPath) {
      const p = PATHS[myPath.id], k = p.steps.indexOf(r), d = p.steps.filter(isDone).length;
      strip.innerHTML = `Your path: <strong>${esc(p.name)}</strong>, step ${k + 1} of ${p.steps.length} (${d} done) · <a href="${ROOT}path/">Back to your path</a>`;
      const prev = $('[data-pager="prev"]'), next = $('[data-pager="next"]'), pager = $(".pager");
      const setLink = (a, cls, dir, rr) => {
        if (!rr) { if (a) a.remove(); return; }
        if (!a) { a = document.createElement("a"); a.className = cls; a.dataset.pager = cls; cls === "prev" ? pager.prepend(a) : pager.append(a); }
        a.href = lessonUrl(rr); a.innerHTML = `<span class="pager-dir">${dir}</span><strong>${esc(ref(rr).l.title)}</strong>`;
      };
      setLink(prev, "prev", "← Previous in your path", p.steps[k - 1]);
      setLink(next, "next", "Next in your path →", p.steps[k + 1]);
      const last = k === p.steps.length - 1;
      target = last ? `${ROOT}path/` : lessonUrl(p.steps[k + 1]);
      doneBtn.textContent = last ? "Done, finish your path →" : "Done, next lesson →";
    } else if (myPath) {
      strip.innerHTML = `This lesson is not in your path (${esc(PATHS[myPath.id].name)}). <a href="${ROOT}path/">Back to your path</a>`;
    }
    if (isDone(r)) {
      $("#done-note").hidden = false;
      doneBtn.textContent = doneBtn.textContent.replace("Done, next lesson", "Next lesson").replace("Done, review", "Review").replace("Done, finish", "Finish");
    }
    doneBtn.href = target;
    doneBtn.addEventListener("click", () => { if (progress[key(m.id, i)] !== true) { progress[key(m.id, i)] = true; save(); } });
    if (techReader() && $("#tech-note")) $("#tech-note").open = true;
    mountDemo();
    initReader();
  }

  // ---------- Next-word demo (lesson "How chatbots work") ----------
  function mountDemo() {
    const host = $('[data-demo="nextword"]'); if (!host) return;
    const NW = { start: "The cat sat on the", first: [["mat", 41], ["sofa", 19], ["floor", 15], ["roof", 9], ["keyboard", 6]],
      second: { mat: [["and", 38], [".", 30], ["purring", 14], ["all", 8]], sofa: [["and", 35], [".", 33], ["next", 12], ["all", 9]], floor: [[".", 40], ["and", 31], ["near", 10], ["by", 8]], roof: [[".", 36], ["and", 28], ["of", 20], ["all", 7]], keyboard: [[".", 34], ["and", 30], ["again", 18], ["while", 10]] } };
    let words = [];
    const draw = focus => {
      const opts = words.length === 0 ? NW.first : words.length === 1 ? NW.second[words[0]] : null;
      const text = NW.start + words.map(w => (w === "." ? "." : " " + w)).join("");
      host.innerHTML = `<div class="nw">
        <p class="nw-label">The text so far</p>
        <p class="nw-text" aria-live="polite">${esc(text)}${opts ? '<span class="nw-cursor" aria-hidden="true"> ▍</span>' : ""}</p>
        ${opts ? `<p class="nw-label" id="nw-h">What the model guesses next. Pick a word to add it.</p>
        <div class="nw-bars" role="group" aria-labelledby="nw-h">${opts.map(([w, p]) => `<button class="nw-bar" type="button" data-w="${esc(w)}" aria-label="${w === "." ? "full stop" : esc(w)}, ${p} percent"><span class="nw-word">${w === "." ? "(full stop)" : esc(w)}</span><span class="nw-track" aria-hidden="true"><span style="width:${p * 2}%"></span></span><span class="nw-pct" aria-hidden="true">${p}%</span></button>`).join("")}</div>
        <p class="nw-note">A chatbot usually picks a likely word, with a little chance mixed in. That is why answers don't always come out the same.</p>`
        : `<p class="nw-note">The model repeats this step for every word of every answer. A real model weighs tens of thousands of possible next words each time.</p>
        <button class="btn-secondary nw-reset" type="button">Start again</button>`}
      </div>`;
      if (focus) $(opts ? ".nw-bar" : ".nw-reset", host)?.focus();
    };
    host.addEventListener("click", e => {
      const b = e.target.closest(".nw-bar"); if (b) { words.push(b.dataset.w); draw(true); return; }
      if (e.target.closest(".nw-reset")) { words = []; draw(true); }
    });
    draw(false);
  }

  // ---------- Read aloud ----------
  // Recorded audio (made with Speechify) plays when this lesson has it; otherwise the device's own voices read it.
  // Voices are ranked so the most natural one on the device is the default; the learner can pick another.
  function initReader() {
    const bar = $("#listen"), dataEl = $("#read-data");
    if (!bar || !dataEl) return;
    let data; try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    const blocks = data.blocks || [];
    const synth = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function" ? window.speechSynthesis : null;
    const hasRecording = blocks.length > 0 && blocks.every(b => b.a);
    if (!synth && !hasRecording) return;
    const RATES = [[0.75, "Slow"], [0.9, "Normal"], [1.05, "A little faster"], [1.25, "Fast"]];
    const snap = v => RATES.reduce((a, [x]) => Math.abs(x - v) < Math.abs(a - v) ? x : a, 0.9);
    let rate = snap(+load("ailearn_rate", 0.9) || 0.9);
    let voicePref = load("ailearn_voice_v1", null);
    let state = "idle", idx = 0, run = 0, msg = "", audio = null, voices = [];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley)\b/i;
    function score(v) {
      let s = 0; const n = v.name;
      if (/natural|neural/i.test(n)) s += 60;
      if (/premium/i.test(n)) s += 50;
      if (/enhanced/i.test(n)) s += 40;
      if (/siri/i.test(n)) s += 35;
      if (/google/i.test(n)) s += 25;
      if (/samantha|ava|allison|zoe|evan|nathan|joelle|noelle|serena|daniel/i.test(n)) s += 8;
      if (/compact|espeak/i.test(n)) s -= 30;
      const lang = (v.lang || "").replace("_", "-").toLowerCase(), want = (navigator.language || "en-US").toLowerCase();
      if (lang === want) s += 6; else if (/^en-(us|gb)$/.test(lang)) s += 3;
      return s;
    }
    function loadVoices() {
      if (!synth) return;
      voices = synth.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang) && !NOVELTY.test(v.name)).sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
      if (state === "idle") render();
    }
    function engine() {
      if (hasRecording && (voicePref === "recorded" || !voicePref || !voices.some(v => v.name === voicePref))) return "recorded";
      return synth && voices.length ? "device" : (hasRecording ? "recorded" : (synth ? "device" : null));
    }
    function deviceVoice() { return voices.find(v => v.name === voicePref) || voices[0] || null; }
    function activeBlocks() {
      const tech = $("#tech-note");
      return blocks.map((b, n) => ({ ...b, n })).filter(b => !b.tech || (tech && tech.open));
    }
    function el(n) { return $(`[data-r="${n}"]`); }
    function mark(n) {
      $$(".reading").forEach(e => e.classList.remove("reading"));
      const e = n == null ? null : el(n); if (!e) return;
      e.classList.add("reading");
      const r = e.getBoundingClientRect();
      if (r.top < 70 || r.bottom > innerHeight) e.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    }
    function sentences(t) { return (t.match(/[^.!?]+[.!?]+["”’')]*\s*|[^.!?]+$/g) || [t]).map(s => s.trim()).filter(Boolean); }
    function setState(s) { state = s; render(); }
    let list = [];
    function finish() { run++; state = "idle"; idx = 0; mark(null); render(); }
    function playFrom(k) {
      const token = ++run;
      idx = k;
      if (k >= list.length) { finish(); return; }
      const b = list[k];
      mark(b.n);
      const gap = () => setTimeout(() => { if (token === run && state === "speaking") playFrom(k + 1); }, b.n === 0 ? 250 : 450);
      if (engine() === "recorded") {
        if (!audio) { audio = new Audio(); audio.preload = "auto"; }
        audio.src = b.a; audio.playbackRate = rate / 0.9;
        audio.onended = () => { if (token === run) gap(); };
        audio.onerror = () => { if (token !== run) return; msg = "The recording didn't load. Choose a device voice in the voice settings, or try again."; finish(); };
        audio.play().catch(() => { if (token !== run) return; msg = "Press Listen again to start."; finish(); });
      } else {
        const parts = sentences(b.t), v = deviceVoice();
        synth.cancel();
        let p = 0;
        const say = () => {
          if (token !== run) return;
          if (p >= parts.length) { gap(); return; }
          const u = new SpeechSynthesisUtterance(parts[p++]);
          if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
          u.rate = rate;
          u.onend = () => { if (token === run && state === "speaking") say(); };
          u.onerror = e => { if (token !== run || e.error === "interrupted" || e.error === "canceled") return; msg = "Your browser couldn't read this aloud."; finish(); };
          synth.speak(u);
        };
        say();
      }
    }
    function start() { msg = ""; list = activeBlocks(); if (!list.length) return; state = "speaking"; render(); playFrom(0); }
    function pause() {
      run++; state = "paused";
      if (audio && engine() === "recorded") audio.pause(); else if (synth) synth.cancel();
      render();
    }
    function resume() {
      state = "speaking"; render();
      if (audio && engine() === "recorded" && audio.src && audio.currentTime > 0 && !audio.ended) {
        const token = ++run, k = idx;
        audio.onended = () => { if (token === run) setTimeout(() => { if (token === run && state === "speaking") playFrom(k + 1); }, 450); };
        audio.play().catch(() => playFrom(idx));
      } else playFrom(idx);
    }
    function stop() { if (audio) audio.pause(); if (synth) synth.cancel(); finish(); }
    function render() {
      const hadFocus = bar.contains(document.activeElement) ? document.activeElement.id || document.activeElement.dataset.act : null;
      const settingsOpen = $("#listen-settings", bar)?.open;
      bar.hidden = false;
      const eng = engine();
      const voiceOpts = (hasRecording ? `<option value="recorded"${eng === "recorded" ? " selected" : ""}>${esc(data.voiceName || "Recorded")} (recorded voice)</option>` : "") +
        voices.map(v => `<option value="${esc(v.name)}"${eng === "device" && deviceVoice() === v ? " selected" : ""}>${esc(v.name.replace(/^Microsoft |^Google /, m => m))} (${esc(v.lang)}, on this device)</option>`).join("");
      const main = state === "idle"
        ? `<button class="listen-btn" type="button" data-act="listen" id="listen-start">${icon("speaker")} Listen to this lesson</button>`
        : `${state === "paused" ? `<button class="listen-btn" type="button" data-act="resume" id="listen-resume">${icon("play")} Resume</button>` : `<button class="listen-btn" type="button" data-act="pause" id="listen-pause">${icon("pause")} Pause</button>`}
           <button class="listen-btn secondary" type="button" data-act="stop" id="listen-stop">${icon("stop")} Stop</button>`;
      bar.innerHTML = `<div class="listen-row">${main}<span class="listen-status" role="status">${state === "paused" ? "Paused" : state === "speaking" ? "Reading aloud" : esc(msg)}</span></div>
        <details class="listen-settings" id="listen-settings"${settingsOpen ? " open" : ""}><summary>Voice settings</summary>
          <div class="listen-fields">
            <label>Voice<select id="listen-voice">${voiceOpts || '<option value="">Your device\'s voice</option>'}</select></label>
            <label>Speed<select id="listen-rate">${RATES.map(([v, t]) => `<option value="${v}"${v === rate ? " selected" : ""}>${t}</option>`).join("")}</select></label>
          </div>
          <p class="listen-hint">${hasRecording ? "The recorded voice sounds the most natural. " : ""}Device voices with Natural, Neural, Premium, Enhanced or Siri in their names usually sound the most human. Your choice is remembered.</p>
        </details>`;
      if (hadFocus) { const f = $(`#${hadFocus}`, bar) || $("button", bar); f?.focus(); }
    }
    bar.addEventListener("click", e => {
      const a = e.target.closest("[data-act]"); if (!a) return;
      const act = a.dataset.act;
      if (act === "listen") start();
      else if (act === "pause") pause();
      else if (act === "resume") resume();
      else if (act === "stop") { stop(); $("#listen-start")?.focus(); }
    });
    bar.addEventListener("change", e => {
      if (e.target.id === "listen-rate") { rate = +e.target.value; store("ailearn_rate", rate); if (audio) audio.playbackRate = rate / 0.9; }
      if (e.target.id === "listen-voice") {
        const was = state; if (state !== "idle") { if (audio) audio.pause(); if (synth) synth.cancel(); run++; }
        voicePref = e.target.value || null; store("ailearn_voice_v1", voicePref);
        if (was !== "idle") { state = "speaking"; render(); playFrom(idx); } else render();
        $("#listen-voice")?.focus();
      }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && state !== "idle") stop(); });
    addEventListener("pagehide", () => { if (synth) synth.cancel(); if (audio) audio.pause(); });
    if (synth) { loadVoices(); synth.addEventListener?.("voiceschanged", loadVoices); if (!("onvoiceschanged" in synth)) setTimeout(loadVoices, 500); }
    render();
    window.__reader = { start, pause, resume, stop, state: () => state, engine, voices: () => voices.map(v => v.name), blocks: () => activeBlocks().length, rate: () => rate };
  }

  // ---------- Tools and models (from catalog.json, updated weekly) ----------
  const toolsGrid = $("#tools-grid"), modelsBox = $("#models-timeline");
  if (toolsGrid || modelsBox || $(".catalog-status")) loadCatalog();
  async function loadCatalog() {
    let cat;
    try { cat = await (await fetch(`${ROOT}catalog.json`, { cache: "no-cache" })).json(); }
    catch (e) {
      $$(".catalog-status").forEach(x => { x.textContent = ""; });
      if (toolsGrid) toolsGrid.innerHTML = '<p class="empty">The list of tools didn\'t load. Refresh the page to try again.</p>';
      if (modelsBox) modelsBox.innerHTML = '<p class="empty">The list of models didn\'t load. Refresh the page to try again.</p>';
      return;
    }
    const d = fmtDate(cat.meta && cat.meta.lastChecked);
    $$(".catalog-status").forEach(x => { x.textContent = d ? `Last checked ${d}` : ""; });
    if (toolsGrid) renderTools(cat.tools || []);
    if (modelsBox) renderModels(cat.models || []);
  }
  const hue = s => ["violet", "magenta", "berry", "coral", "crimson", "plum"][[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 6];
  const safeUrl = u => (typeof u === "string" && u.startsWith("https://")) ? u : null;
  const curly = v => typeof v === "string" ? v.replace(/(\w)'(\w)/g, "$1\u2019$2").replace(/(^|[\s(])"/g, "$1\u201c").replace(/"/g, "\u201d").replace(/'/g, "\u2019") : v;
  function renderTools(tools) {
    // Two groups (legal and general) plus a menu for the kind of tool. Shown as a list of rows, not cards.
    const CATS = { legal: "Legal work", chat: "Chatbots", search: "Search", learning: "Learning", writing: "Writing and notes", image: "Pictures and design", video: "Video", audio: "Voices and music", code: "Coding" };
    const isNew = x => { const t = Date.parse(x); return !isNaN(t) && (Date.now() - t) / 864e5 <= 60; };
    const live = tools.filter(t => t.name).map(t => ({ ...t, desc: curly(t.desc), bestFor: curly(t.bestFor), start: curly(t.start) }));
    const legal = live.filter(t => t.cat === "legal"), general = live.filter(t => t.cat !== "legal");
    let group = "legal", kind = "all";
    const filters = $("#tools-filter");
    const row = t => { const url = safeUrl(t.url); return `<article class="tool-row tool-card">
        <div class="tool-id"><h3>${esc(t.name)}</h3><p class="tool-maker">${esc(t.maker)}${isNew(t.addedAt) ? ' <span class="new-pill">New</span>' : ""}</p>
          <p class="tool-tags"><span>${esc(CATS[t.cat] || t.cat)}</span><span>${esc(t.price || "")}</span></p></div>
        <div class="tool-body"><p class="tool-desc">${esc(t.desc)}</p>
          <dl class="tool-facts">${t.bestFor ? `<div><dt>Good for</dt><dd>${esc(t.bestFor)}</dd></div>` : ""}${t.start ? `<div><dt>Try first</dt><dd>${esc(t.start)}</dd></div>` : ""}</dl>
          ${url ? `<a class="tool-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Visit ${esc(t.name)}<span class="sr-only"> (opens in a new tab)</span> ${icon("ext")}</a>` : ""}</div>
      </article>`; };
    const sorted = arr => [...arr].sort((a, b) => (isNew(b.addedAt) - isNew(a.addedAt)) || a.name.localeCompare(b.name));
    const section = (id, title, arr) => arr.length ? `<section class="tool-group" aria-labelledby="tg-${id}"><h2 id="tg-${id}">${title} <span class="count">(${arr.length})</span></h2>${sorted(arr).map(row).join("")}</section>` : "";
    const draw = () => {
      const kinds = [...new Set(general.map(t => t.cat))].filter(c => CATS[c]);
      filters.innerHTML = `<div class="seg" role="group" aria-label="Which tools to show">${[["legal", `Legal AI tools (${legal.length})`], ["general", `General AI tools (${general.length})`], ["all", "All"]].map(([g, l]) => `<button class="seg-btn filter-btn" type="button" data-group="${g}" aria-pressed="${group === g}">${l}</button>`).join("")}</div>
        ${group !== "legal" ? `<label class="kind-pick">Kind of tool <select id="tools-kind"><option value="all">All kinds</option>${kinds.map(c => `<option value="${c}"${kind === c ? " selected" : ""}>${CATS[c]}</option>`).join("")}</select></label>` : ""}`;
      const g2 = general.filter(t => kind === "all" || t.cat === kind);
      toolsGrid.innerHTML = (group === "legal" ? section("legal", "Legal AI tools", legal)
        : group === "general" ? section("general", "General AI tools", g2)
        : section("legal", "Legal AI tools", legal) + section("general", "General AI tools", g2)) || '<p class="empty">No tools of this kind yet.</p>';
    };
    filters.addEventListener("click", e => { const b = e.target.closest("[data-group]"); if (!b) return; group = b.dataset.group; kind = "all"; draw(); $(`[data-group="${group}"]`, filters)?.focus(); });
    filters.addEventListener("change", e => { if (e.target.id !== "tools-kind") return; kind = e.target.value; draw(); $("#tools-kind")?.focus(); });
    draw();
  }
  function renderModels(models) {
    const ERAS = [{ to: 2020, label: "2017 to 2020", name: "The first big language models" }, { to: 2022, label: "2021 to 2022", name: "Bigger models, better results" },
      { to: 2024, label: "2023 to 2024", name: "Chatbots go mainstream" }, { to: 2025, label: "2025", name: "Thinking models and agents" }];
    const KIND = { Flagship: "Main model", Reasoning: "Thinking model", Multimodal: "Multimodal", "Open model": "Open model", Image: "Pictures", Video: "Video", Coding: "Coding", Science: "Science", Milestone: "Milestone", Breakthrough: "Big step forward", Foundational: "Foundation" };
    const maxYear = Math.max(...models.map(m => +m.year || 0)), groups = [];
    for (const m of [...models].filter(m => m.name).sort((a, b) => (a.year - b.year) || String(a.name).localeCompare(b.name))) {
      const y = +m.year, era = ERAS.find(e => y <= e.to);
      const id = era ? era.label : String(y), name = era ? era.name : (y === maxYear ? "The latest models" : "Recent models");
      let g = groups.find(x => x.id === id); if (!g) groups.push(g = { id, name, items: [] });
      g.items.push(m);
    }
    modelsBox.innerHTML = groups.map(g => `<section class="model-era" aria-label="${esc(g.id)}: ${esc(g.name)}"><h2 class="era-label"><span class="era-years">${esc(g.id)}</span> ${esc(g.name)}</h2>
      <div class="models-row">${g.items.map(m => `<article class="card model-card${m.current ? " is-current" : ""}">
        <div class="model-badges">${m.current ? '<span class="model-badge current">In use today</span>' : ""}<span class="model-badge">${esc(KIND[m.kind] || m.kind)}</span></div>
        <h3 class="model-name">${esc(m.name)}</h3><p class="model-maker">${esc(m.maker)} · ${esc(m.year)}</p>
        <p class="model-desc">${esc(curly(m.desc))}</p></article>`).join("")}</div></section>`).join("");
  }

  // ---------- Site search (index built by build.py, loaded only on the search page) ----------
  const siteSearch = $("#site-search");
  if (siteSearch && window.SEARCH_INDEX) {
    const IDX = window.SEARCH_INDEX.map(e => ({ ...e, lt: e.t.toLowerCase(), ld: (e.d || "").toLowerCase(), lx: (e.x || "").toLowerCase() }));
    const out = $("#search-results"), count = $("#search-count");
    const mark = (text, words) => { let h = esc(text); words.forEach(w => { h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark>$1</mark>"); }); return h; };
    const snippet = (e, words) => {
      const src = e.lx && words.some(w => e.lx.includes(w)) && !words.every(w => e.ld.includes(w)) ? e.x : e.d;
      const low = src.toLowerCase(), first = Math.min(...words.map(w => { const i = low.indexOf(w); return i < 0 ? Infinity : i; }));
      const at = isFinite(first) ? Math.max(0, first - 70) : 0;
      const cut = src.slice(at, at + 220);
      return (at > 0 ? "…" : "") + mark(cut, words) + (at + 220 < src.length ? "…" : "");
    };
    const run = () => {
      const q = siteSearch.value.trim().toLowerCase(), words = q.split(/\s+/).filter(w => w.length > 1);
      try { history.replaceState(null, "", q ? `?q=${encodeURIComponent(siteSearch.value.trim())}` : location.pathname); } catch (e) {}
      if (!words.length) { out.innerHTML = ""; count.textContent = ""; return; }
      const hits = IDX.map(e => {
        if (!words.every(w => e.lt.includes(w) || e.ld.includes(w) || e.lx.includes(w))) return null;
        let sc = 0; words.forEach(w => { if (e.lt.includes(w)) sc += 10; if (e.ld.includes(w)) sc += 4; sc += Math.min(5, e.lx.split(w).length - 1); });
        if (e.lt === q) sc += 20;
        return { e, sc };
      }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 30);
      count.textContent = hits.length ? `${hits.length} result${hits.length > 1 ? "s" : ""} for \u201c${siteSearch.value.trim()}\u201d` : `No results for \u201c${siteSearch.value.trim()}\u201d. Try a shorter or different word.`;
      out.innerHTML = hits.map(({ e }) => `<li><p class="result-kind">${esc(e.k)}${e.m ? ` · ${esc(e.m)}` : ""}</p><a href="${ROOT}${e.u}">${mark(e.t, words)}</a><p class="result-snip">${snippet(e, words)}</p></li>`).join("");
    };
    const q0 = new URLSearchParams(location.search).get("q");
    if (q0) siteSearch.value = q0;
    let t = null;
    siteSearch.addEventListener("input", () => { clearTimeout(t); t = setTimeout(run, 120); });
    run();
    if (!q0) siteSearch.focus();
  }

  // ---------- Glossary search ----------
  const gs = $("#glossary-search");
  if (gs) {
    const items = $$(".glossary-item"), total = items.length;
    gs.addEventListener("input", () => {
      const q = gs.value.trim().toLowerCase(); let shown = 0;
      items.forEach(el => { const hit = !q || el.textContent.toLowerCase().includes(q); el.hidden = !hit; if (hit) shown++; });
      $$(".gloss-group").forEach(gr => { gr.hidden = !$$(".glossary-item", gr).some(x => !x.hidden); });
      $("#glossary-count").textContent = q ? `${shown} of ${total} terms` : `${total} terms`;
      $("#glossary-empty").hidden = shown > 0;
    });
  }
})();
