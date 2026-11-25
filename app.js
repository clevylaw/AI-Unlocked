(function () {
  const MODULES = window.MODULES, GLOSSARY = window.GLOSSARY, PATHS = window.PATHS, QUESTIONS = window.QUESTIONS;
  const inClaude = !!(window.claude && window.claude.use);
  // Times come from the text itself: reading at about 200 words a minute, plus 1 minute for the quiz and 2 for the Try it prompt.
  const wordsIn = h => (h || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
  MODULES.forEach(m => m.lessons.forEach(l => {
    l.read = Math.max(1, Math.round((wordsIn(l.content) + wordsIn(l.intro)) / 200));
    l.practice = (l.quiz ? 1 : 0) + (l.tryIt ? 2 : 0);
    l.time = l.read + l.practice;
  }));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => (typeof u === "string" && u.startsWith("https://")) ? u : null;

  const ICONS = {
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    play: '<path d="m6 3 14 9-14 9z"/>',
    speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>'
  };
  const icon = (name, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  // ---------- Stored state (this browser only) ----------
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
  const store = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let progress = load("ailearn_progress_v2", {});
  let myPath = load("ailearn_path_v1", null);
  if (myPath && !PATHS[myPath.id]) myPath = null;
  let certs = load("ailearn_certs_v1", []);
  let certName = load("ailearn_certname_v1", "");
  function writeLocal() {
    store("ailearn_progress_v2", progress); store("ailearn_path_v1", myPath);
    store("ailearn_certs_v1", certs); store("ailearn_certname_v1", certName || null);
    store("ailearn_updated_v1", Date.now());
  }
  function save() { award(); writeLocal(); sync.push(); }
  const newCertId = () => "AIU-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  function award() {
    const today = new Date().toISOString().slice(0, 10);
    if (myPath) {
      const p = PATHS[myPath.id];
      if (p.steps.every(r => isDone(r)) && !certs.some(c => c.kind === "path" && c.pathId === myPath.id))
        certs.push({ id: newCertId(), kind: "path", pathId: myPath.id, title: p.name, date: today, lessons: p.steps.length, known: p.steps.filter(r => isKnown(r)).length });
    }
    const all = MODULES.flatMap(m => m.lessons.map((_, i) => `${m.id}-${i + 1}`));
    if (all.every(r => isDone(r)) && !certs.some(c => c.kind === "course"))
      certs.push({ id: newCertId(), kind: "course", title: "The complete AI Unlocked course", date: today, lessons: all.length, known: all.filter(r => isKnown(r)).length });
  }
  const key = (m, i) => `${m}_${i}`;
  const ref = r => { const [mid, li] = r.split("-").map(Number); const m = MODULES.find(x => x.id === mid); return { m, i: li - 1, l: m.lessons[li - 1] }; };
  const isDone = r => { const { m, i } = ref(r); return !!progress[key(m.id, i)]; };
  const isKnown = r => { const { m, i } = ref(r); return progress[key(m.id, i)] === "known"; };
  const doneCount = m => m.lessons.filter((_, i) => progress[key(m.id, i)]).length;
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const totalMinutes = MODULES.reduce((s, m) => s + m.lessons.reduce((a, l) => a + l.time, 0), 0);

  function updateProgressUI() {
    const done = MODULES.reduce((s, m) => s + doneCount(m), 0);
    $("#progress-text").textContent = `${done} of ${totalLessons} lessons`;
    $("#progress-bar").style.width = `${(done / totalLessons) * 100}%`;
    renderModules();
    if (!placement.active) renderPathBox();
    renderHeroCard();
  }
  let toolCount = null;
  function renderStats(n) { if (n != null) toolCount = n; renderHeroCard(); }

  // ---------- Questionnaire & paths ----------
  const quiz = { active: !myPath, step: 0, answers: [] };
  function pathReason(p) {
    const a = p.answers || [];
    if (a.length < 3) return "";
    const parts = [0, 1, 2].map(n => QUESTIONS[n].phrase[a[n]]);
    return `You said you ${parts[0]}, ${parts[1]}, and want to ${parts[2]}.`;
  }
  function renderQuiz() {
    const q = QUESTIONS[quiz.step], n = QUESTIONS.length;
    $("#path-box").innerHTML = `<div class="pq">
      <div class="pq-top"><span class="eyebrow">Find your learning path</span><span class="pq-count">Question ${quiz.step + 1} of ${n}</span></div>
      <div class="pq-dots" aria-hidden="true">${QUESTIONS.map((_, k) => `<span class="${k < quiz.step ? "done" : k === quiz.step ? "now" : ""}"></span>`).join("")}</div>
      <h3 id="pq-q" tabindex="-1">${esc(q.q)}</h3>
      ${quiz.step === 0 ? '<p class="pq-help">Takes about a minute. Pick the answer closest to you; you can change it later.</p>' : ""}
      <div class="pq-opts" role="radiogroup" aria-labelledby="pq-q">${q.opts.map((o, k) => `<button class="pq-opt" role="radio" aria-checked="${quiz.answers[quiz.step] === k}" data-ans="${k}">${esc(o)}</button>`).join("")}</div>
      <div class="pq-actions">
        ${quiz.step > 0 ? '<button class="btn-secondary" data-quiz-back>← Back</button>' : (!myPath ? '<button class="link-btn" data-skip-quiz>Skip the questions and start the beginner path</button>' : "<span></span>")}
        ${myPath ? '<button class="link-btn" data-quiz-cancel>Keep my current path</button>' : ""}
      </div>
    </div>`;
  }
  function finishQuiz() {
    const a = quiz.answers;
    myPath = { id: window.choosePath(a), answers: a.slice(0, 3), time: QUESTIONS[3].minutes[a[3]] ?? 20 };
    save();
    quiz.active = false;
    renderPathBox(); renderHeroCard();
    $("#path-title")?.focus();
  }
  function nextStepIndex(p) { const i = p.steps.findIndex(r => !isDone(r)); return i; }
  function renderPathBox() {
    if (quiz.active || !myPath) { quiz.active = true; renderQuiz(); return; }
    const p = PATHS[myPath.id], steps = p.steps;
    const done = steps.filter(isDone).length, mins = steps.reduce((s, r) => s + ref(r).l.time, 0);
    const sittings = Math.max(1, Math.ceil(mins / (myPath.time || 20)));
    const nx = nextStepIndex(p);
    const others = Object.keys(PATHS).filter(k => k !== myPath.id);
    const knownN = steps.filter(isKnown).length, remaining = steps.length - done;
    const pathCert = certs.find(c => c.kind === "path" && c.pathId === myPath.id);
    $("#path-box").innerHTML = `<div class="path-view">
      <div class="path-head">
        <span class="eyebrow">Your learning path</span>
        <h3 id="path-title" tabindex="-1">${esc(p.name)}</h3>
        <p>${esc(p.summary)}</p>
        ${pathReason(myPath) ? `<p class="path-why">${esc(pathReason(myPath))}</p>` : ""}
        <p class="path-stats">${steps.length} lessons · about ${mins} minutes including practice · ${sittings} sitting${sittings > 1 ? "s" : ""} of ${myPath.time || 20} minutes</p>
        <div class="path-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${done}" aria-label="Path progress"><span style="width:${(done / steps.length) * 100}%"></span></div>
        <p class="path-done-text">${done} of ${steps.length} done${knownN ? ` (${knownN} placed out by the placement check)` : ""}</p>
        ${nx === -1
          ? `<p class="path-complete">${icon("check", "ico-sm")} You've finished this path. Revisit any lesson below, or try another path.</p>
             ${pathCert ? `<button class="btn-main" data-cert="${esc(pathCert.id)}">View your certificate →</button>` : ""}`
          : `<button class="btn-main" data-path-step="${nx}">${done === 0 ? "Start" : "Continue"}: ${esc(ref(steps[nx]).l.title)} →</button>
             ${remaining >= 2 ? `<div class="placement-offer"><p><strong>Already know some of this?</strong> Take a ${remaining}-question placement check, about ${Math.max(1, Math.round(remaining * 0.4))} minutes. Lessons you answer correctly are marked as known so you can skip them.</p><button class="btn-secondary" data-placement-start>Take the placement check</button></div>` : ""}`}
        ${knownN ? `<p class="path-note"><button class="link-btn" data-unknown>Undo placement</button> to bring placed-out lessons back into your path.</p>` : ""}
      </div>
      <ol class="path-steps">${steps.map((r, k) => { const { m, l } = ref(r), d = isDone(r); return `<li><button class="path-step${d ? " done" : ""}${k === nx ? " next" : ""}" data-path-step="${k}">
        <span class="ps-num c-${m.color}">${d ? icon("check", "ico-sm") : k + 1}</span>
        <span class="ps-text"><strong>${esc(l.title)}</strong><span>Module ${m.id}: ${esc(m.title)} · ${l.time} min${k === nx ? " · Up next" : ""}${isKnown(r) ? " · Placed out" : ""}</span></span>
      </button></li>`; }).join("")}</ol>
      <div class="path-switch">
        <p>Not quite right? <button class="link-btn" data-retake>Retake the questions</button> or switch to another path:</p>
        <div class="chips">${others.map(k => `<button class="chip" data-switch-path="${k}">${esc(PATHS[k].name)}</button>`).join("")}</div>
        <p class="path-note">Lessons outside your path are always available in All lessons below.</p>
      </div>
      ${certs.length ? `<div class="certs-list"><h4>Your certificates</h4>${certs.map(c => `<button class="cert-item" data-cert="${esc(c.id)}"><span class="cert-seal" aria-hidden="true">AI</span><span class="ps-text"><strong>${esc(c.title)}</strong><span>Earned ${esc(fmtDate(c.date) || c.date)}</span></span></button>`).join("")}</div>` : ""}
    </div>`;
  }

  // ---------- Placement check ----------
  const placement = { active: false, items: [], idx: 0, right: [] };
  function startPlacement() {
    const p = PATHS[myPath.id];
    placement.items = p.steps.filter(r => !isDone(r));
    placement.idx = 0; placement.right = []; placement.active = true;
    renderPlacement();
    $("#pl-q")?.focus();
  }
  function renderPlacement() {
    const n = placement.items.length, k = placement.idx;
    if (k >= n) return renderPlacementResult();
    const { m, l } = ref(placement.items[k]), q = l.quiz, order = shuffled(q.opts.length);
    $("#path-box").innerHTML = `<div class="pq">
      <div class="pq-top"><span class="eyebrow">Placement check</span><span class="pq-count">Question ${k + 1} of ${n}</span></div>
      <div class="pq-dots" aria-hidden="true">${placement.items.map((_, j) => `<span class="${j < k ? "done" : j === k ? "now" : ""}"></span>`).join("")}</div>
      <p class="pl-topic">From “${esc(l.title)}” · Module ${m.id}</p>
      <h3 id="pl-q" tabindex="-1">${esc(q.q)}</h3>
      <div class="pq-opts one-col" role="group" aria-labelledby="pl-q">${order.map(o => `<button class="pq-opt" data-pl-ans="${o}">${esc(q.opts[o])}</button>`).join("")}
        <button class="pq-opt unsure" data-pl-ans="-1">I'm not sure</button></div>
      <div class="pq-actions"><span class="path-note">Only lessons you answer correctly are skipped. Guessing isn't worth it.</span><button class="link-btn" data-pl-cancel>Stop the check</button></div>
    </div>`;
  }
  function renderPlacementResult() {
    const got = placement.items.filter((_, j) => placement.right[j]);
    got.forEach(r => { const { m, i } = ref(r); if (!progress[key(m.id, i)]) progress[key(m.id, i)] = "known"; });
    placement.active = false;
    save(); updateProgressUI();
    const left = PATHS[myPath.id].steps.filter(r => !isDone(r)).length;
    $("#path-box").innerHTML = `<div class="pq">
      <span class="eyebrow">Placement check results</span>
      <h3 id="pl-q" tabindex="-1">You already know ${got.length} of ${placement.items.length} lessons</h3>
      <p class="pl-summary">${got.length ? "These are marked as known, so your path skips them. You can still open them any time." : "No lessons were skipped, so your path stays as it was. That's a good sign the lessons will be useful."} ${left ? `You have ${left} lesson${left > 1 ? "s" : ""} left.` : "That completes your path."}</p>
      ${got.length ? `<ul class="pl-known">${got.map(r => `<li>${icon("check", "ico-sm")} ${esc(ref(r).l.title)}</li>`).join("")}</ul>` : ""}
      <div class="pq-actions"><button class="btn-main" data-pl-done>See my updated path →</button></div>
    </div>`;
    $("#pl-q").focus();
  }
  document.addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-placement-start]")) { startPlacement(); return; }
    const a = t.closest("[data-pl-ans]");
    if (a) {
      const { l } = ref(placement.items[placement.idx]);
      placement.right[placement.idx] = +a.dataset.plAns === l.quiz.correct;
      placement.idx++; renderPlacement(); $("#pl-q")?.focus(); return;
    }
    if (t.closest("[data-pl-cancel]")) {
      if (!placement.idx) { placement.active = false; renderPathBox(); $("#path-title")?.focus(); return; }
      placement.items = placement.items.slice(0, placement.idx); renderPlacementResult(); return;
    }
    if (t.closest("[data-pl-done]")) { renderPathBox(); $("#path-title")?.focus(); return; }
    if (t.closest("[data-unknown]")) {
      PATHS[myPath.id].steps.forEach(r => { const { m, i } = ref(r); if (progress[key(m.id, i)] === "known") delete progress[key(m.id, i)]; });
      save(); updateProgressUI(); $("#path-title")?.focus(); return;
    }
    const c = t.closest("[data-cert]");
    if (c) { if (!view.contains(c)) lastFocus = c; openCertificate(c.dataset.cert); }
  });
  function firstUnfinished() {
    for (const m of MODULES) for (let i = 0; i < m.lessons.length; i++) if (!progress[key(m.id, i)]) return `${m.id}-${i + 1}`;
    return null;
  }
  function renderHeroCard() {
    const box = $("#hero-card"), acts = $("#hero-actions");
    const started = Object.keys(progress).length > 0;
    $("#how").hidden = !!myPath;
    $("#nav-progress").hidden = !started;
    $("#nav-path").textContent = myPath ? "Your path" : "Start here";
    if (myPath) {
      const p = PATHS[myPath.id], done = p.steps.filter(isDone).length, nx = nextStepIndex(p);
      acts.innerHTML = nx === -1
        ? `<a class="btn-hero primary" href="#path">See your path and certificate</a><a class="btn-hero ghost" href="#modules">Browse all lessons</a>`
        : `<button class="btn-hero primary" data-path-step="${nx}">${done ? "Continue" : "Start"}: ${esc(ref(p.steps[nx]).l.title)} →</button><a class="btn-hero ghost" href="#path">View your path</a>`;
      box.innerHTML = `<div class="path-title">Your path</div>
        <p class="hero-path-name">${esc(p.name)}</p>
        <div class="path-bar light" aria-hidden="true"><span style="width:${(done / p.steps.length) * 100}%"></span></div>
        <p class="hero-card-text">${done} of ${p.steps.length} lessons done</p>
        <a class="hero-card-link" href="#path">See your path →</a>`;
      return;
    }
    const fu = firstUnfinished();
    acts.innerHTML = started && fu
      ? `<button class="btn-hero primary" data-open-ref="${fu}">Continue: ${esc(ref(fu).l.title)} →</button><a class="btn-hero ghost" href="#path" data-focus-quiz>Find your learning path</a>`
      : `<a class="btn-hero primary" href="#path" data-focus-quiz>Start here: find your path →</a><button class="btn-hero ghost" data-open-ref="1-1">Or begin with Lesson 1</button>`;
    box.innerHTML = `<div class="path-title">What's inside</div>
      <ul class="hero-inside">
        <li><strong>${Object.keys(PATHS).length} learning paths</strong>, matched to your experience and goals</li>
        <li><strong>${totalLessons} short lessons</strong>, each a couple of minutes to read</li>
        <li><strong>Practice in every lesson</strong>, with a real AI tool and a quick question</li>
        <li><strong>Read aloud</strong> any lesson if you'd rather listen</li>
        <li><strong>A certificate</strong> when you finish your path</li>
        ${toolCount ? `<li><strong>A guide to ${toolCount} AI tools</strong>, checked every week</li>` : ""}
      </ul>`;
  }
  document.addEventListener("click", e => {
    const t = e.target;
    const ans = t.closest("[data-ans]");
    if (ans) {
      quiz.answers[quiz.step] = +ans.dataset.ans;
      if (quiz.step < QUESTIONS.length - 1) { quiz.step++; renderQuiz(); $("#pq-q").focus(); } else finishQuiz();
      return;
    }
    if (t.closest("[data-skip-quiz]")) {
      myPath = { id: "starter", answers: [], time: 20 }; quiz.active = false;
      save(); renderPathBox(); renderHeroCard(); $("#path-title").focus(); return;
    }
    const or = t.closest("[data-open-ref]");
    if (or) { const r = ref(or.dataset.openRef); ctx = null; currentModule = r.m; lastFocus = or; openLesson(r.i); return; }
    if (t.closest("[data-quiz-back]")) { quiz.step = Math.max(0, quiz.step - 1); renderQuiz(); $("#pq-q").focus(); return; }
    if (t.closest("[data-quiz-cancel]")) { quiz.active = false; renderPathBox(); $("#path-title").focus(); return; }
    if (t.closest("[data-retake]")) { quiz.active = true; quiz.step = 0; quiz.answers = []; renderQuiz(); $("#pq-q").focus(); return; }
    const sw = t.closest("[data-switch-path]");
    if (sw) { myPath = { ...myPath, id: sw.dataset.switchPath, answers: [] }; save(); renderPathBox(); renderHeroCard(); $("#path-title").focus(); return; }
    if (t.closest("[data-focus-quiz]")) { setTimeout(() => $("#pq-q")?.focus({ preventScroll: true }), 350); }
    const ps = t.closest("[data-path-step]");
    if (ps) { openPathStep(+ps.dataset.pathStep, ps); return; }
    const reset = t.closest("[data-reset]");
    if (reset) { $("#reset-confirm").hidden = false; $("#reset-yes").focus(); return; }
    if (t.closest("#reset-no")) { $("#reset-confirm").hidden = true; return; }
    if (t.closest("#reset-yes")) {
      progress = {}; myPath = null; save();
      quiz.active = true; quiz.step = 0; quiz.answers = [];
      $("#reset-confirm").hidden = true; updateProgressUI(); $("#reset-done").hidden = false;
      setTimeout(() => { $("#reset-done").hidden = true; }, 4000);
    }
  });

  // ---------- Modules ----------
  function renderModules() {
    $("#modules-grid").innerHTML = MODULES.map(m => {
      const done = doneCount(m), total = m.lessons.length, mins = m.lessons.reduce((a, l) => a + l.time, 0);
      const label = done === 0 ? "Start" : done === total ? "Review" : "Continue";
      return `<article class="module-card c-${m.color}${done === total ? " is-done" : ""}">
        <div class="module-top">
          <div class="module-icon">${icon(m.icon)}</div>
          <span class="module-num">Module ${m.id}<span class="level">${esc(m.level)}</span></span>
          ${done === total ? `<span class="done-pill">${icon("check", "ico-sm")} Done</span>` : ""}
        </div>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.desc)}</p>
        <div class="module-bar" aria-hidden="true"><span style="width:${(done / total) * 100}%"></span></div>
        <div class="module-footer">
          <span class="meta">${icon("clock", "ico-sm")} ${mins} min · ${done} of ${total} done</span>
          <button class="module-btn" data-open-module="${m.id}" aria-label="${label} module ${m.id}: ${esc(m.title)}">${label}</button>
        </div>
      </article>`;
    }).join("");
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-open-module]");
    if (b) openModule(+b.dataset.openModule, b);
  });

  let currentModule = null, currentLesson = null, lastFocus = null, ctx = null;
  function openModule(id, opener) {
    ctx = null;
    currentModule = MODULES.find(m => m.id === id);
    if (!currentModule) return;
    if (opener) lastFocus = opener;
    const m = currentModule;
    $("#modal-eyebrow").textContent = `Module ${m.id} · ${m.level}`;
    $("#modal-title").textContent = m.title;
    $("#modal-desc").textContent = m.desc;
    $("#modal-lessons").innerHTML = m.lessons.map((l, i) => {
      const d = progress[key(m.id, i)];
      return `<button class="lesson-item${d ? " done" : ""}" data-lesson="${i}">
        <span class="lesson-num">${d ? icon("check", "ico-sm") : i + 1}</span>
        <span class="lesson-info"><strong>${esc(l.title)}</strong><span>${esc(l.intro)}</span></span>
        <span class="lesson-time">${l.time} min</span>
      </button>`;
    }).join("");
    const overlay = $("#modal-overlay");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("open"));
    $("#modal-close").focus();
  }
  $("#modal-lessons").addEventListener("click", e => {
    const b = e.target.closest("[data-lesson]");
    if (b) openLesson(+b.dataset.lesson);
  });
  function closeModal(restore = true) {
    const overlay = $("#modal-overlay");
    overlay.classList.remove("open");
    overlay.hidden = true;
    if (restore && lastFocus) lastFocus.focus();
  }
  $("#modal-close").addEventListener("click", () => closeModal());
  $("#modal-overlay").addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(); });

  // ---------- Quizzes ----------
  function shuffled(n) {
    const a = [...Array(n).keys()];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function quizHtml(q, qid, heading) {
    const order = shuffled(q.opts.length);
    return `<div class="quiz-block" id="${qid}" data-correct="${q.correct}">
      <h4>${esc(heading)}${esc(q.q)}</h4>
      <div class="quiz-options">${order.map((o, pos) => `<button class="quiz-opt" data-opt="${o}"><span class="opt-letter">${String.fromCharCode(65 + pos)}</span><span>${esc(q.opts[o])}</span></button>`).join("")}</div>
      <div class="quiz-feedback" role="status" aria-live="polite" data-feedback="${esc(q.feedback)}"></div>
    </div>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest(".quiz-opt");
    if (!b) return;
    const block = b.closest(".quiz-block");
    if (block.dataset.answered) return;
    block.dataset.answered = "1";
    const correct = +block.dataset.correct, chosen = +b.dataset.opt;
    block.dataset.result = chosen === correct ? "right" : "wrong";
    $$(".quiz-opt", block).forEach(o => {
      o.disabled = true;
      if (+o.dataset.opt === correct) o.classList.add("correct");
      else if (o === b) o.classList.add("wrong");
    });
    const fb = $(".quiz-feedback", block);
    fb.textContent = (chosen === correct ? "Correct. " : "Not quite. ") + fb.dataset.feedback;
    fb.className = `quiz-feedback show ${chosen === correct ? "ok" : "bad"}`;
    const summary = block.closest("[data-review]");
    if (summary) updateReviewScore(summary);
  });

  // ---------- Lesson view ----------
  const view = $("#lesson-view");
  function showView() {
    view.hidden = false;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => view.classList.add("open"));
    view.scrollTop = 0;
  }
  function hideView() { reader.stop(); view.classList.remove("open"); view.hidden = true; document.body.classList.remove("no-scroll"); }

  // ---------- Read aloud ----------
  const reader = (() => {
    const synth = window.speechSynthesis;
    let engine = synth && typeof SpeechSynthesisUtterance === "function" ? "browser" : null;
    let tts = null, state = "idle", lines = [], els = [], msg = "", disabled = false, run = 0;
    let rate = +load("ailearn_rate", 1) || 1;
    const clean = s => s.replace(/\s+/g, " ").trim();
    const punct = s => /[.!?:…"”')]$/.test(s) ? s : s + ".";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async () => {
      try {
        const t = window.claude && window.claude.use ? await window.claude.use("tts") : null;
        if (!t) return;
        tts = t; engine = "claude";
        t.setRate?.(rate);
        t.onState(e => { setState(e.state); if (e.state === "idle") ended(e.reason); });
        t.onLine(e => mark(+e.id));
        render();
      } catch (e) {}
    })();
    function blockText(el) {
      if (el.matches("pre.code")) return "There's a code example on screen.";
      if (el.matches(".deeper")) return "Going deeper, for technical readers. " + clean($("p", el).textContent);
      if (el.matches("[data-demo]")) return "There's an interactive demo on screen you can try.";
      if (el.matches(".try-it")) return `Try it yourself. Open ${clean($(".try-tool strong", el).textContent)}, and paste this prompt: ${clean($("#try-text", el).textContent)}`;
      if (el.matches("figure")) return [$("svg", el)?.getAttribute("aria-label"), $("figcaption", el)?.textContent].filter(Boolean).map(s => punct(clean(s))).join(" ");
      if (el.matches(".quiz-block")) {
        const opts = $$(".quiz-opt", el).map(b => b.innerText.split("\n").map(clean).filter(Boolean).join(". "));
        return `${punct(clean($("h4", el).textContent))} The options are: ${opts.map(punct).join(" ")}`;
      }
      return (el.innerText || el.textContent).split("\n").map(s => clean(s.replace(/\t+/g, ": "))).filter(Boolean).map(punct).join(" ");
    }
    function split(t, max) {
      if (t.length <= max) return [t];
      const out = []; let cur = "";
      for (const s of t.match(/[^.!?]+[.!?]+["”')]?\s*|[^.!?]+$/g) || [t]) { if ((cur + s).length > max && cur) { out.push(cur.trim()); cur = ""; } cur += s; }
      if (cur.trim()) out.push(cur.trim());
      return out.flatMap(x => x.length > max ? x.match(new RegExp(`.{1,${max}}(\\s|$)`, "g")).map(clean).filter(Boolean) : [x]);
    }
    function collect() {
      const root = $("#lesson-content");
      const blocks = [$("#lesson-heading", root), $(".lesson-intro", root), ...$$(".lesson-body > *", root), $(".deeper[open]", root), $(".try-it", root), $(".quiz-block", root)].filter(Boolean);
      lines = []; els = [];
      root.classList.add("no-tt");
      for (const el of blocks) { const text = blockText(el); if (!text) continue; for (const part of split(text, engine === "browser" ? 220 : 1800)) { lines.push(part); els.push(el); } }
      root.classList.remove("no-tt");
      if (lines.length > 100) { lines = lines.slice(0, 100); els = els.slice(0, 100); }
      return lines;
    }
    function clearMark() { $$(".reading", view).forEach(e => e.classList.remove("reading")); }
    function mark(i) {
      clearMark();
      const el = els[i]; if (!el || !document.contains(el)) return;
      el.classList.add("reading");
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.bottom > innerHeight) el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    }
    function setState(s) { state = s; render(); }
    function ended(reason) {
      clearMark();
      if (reason === "not_granted" || reason === "unavailable") disabled = true;
      else if (reason === "rate_limited") msg = "Reading aloud has reached its limit for now. Try again later.";
      else if (reason === "upstream_error") msg = "The audio stopped early. Press Listen to try again.";
      render();
    }
    function start() {
      msg = "";
      if (!collect().length) return;
      const token = ++run;
      if (engine === "claude") {
        state = "starting"; render();
        tts.speak(lines.map((text, i) => ({ text, id: String(i) })), { language: "en", rate }).catch(err => {
          if (token !== run || err.code === "stopped") return;
          if (err.code === "not_granted" || err.code === "unavailable") disabled = true;
          msg = { no_gesture: "Press Listen again to start.", busy: "Reading aloud is busy right now. Try again in a moment.", rate_limited: "Reading aloud has reached its limit for now. Try again later.", upstream_error: "The audio stopped early. Press Listen to try again." }[err.code] || "";
          setState("idle"); clearMark();
        });
      } else if (engine === "browser") {
        synth.cancel();
        const voice = (synth.getVoices() || []).find(v => /^en(-|_|$)/i.test(v.lang) && /natural|enhanced|premium|google|samantha/i.test(v.name)) || null;
        const go = i => {
          if (token !== run) return;
          if (i >= lines.length) { setState("idle"); clearMark(); return; }
          const u = new SpeechSynthesisUtterance(lines[i]);
          u.lang = "en-US"; u.rate = rate; if (voice) u.voice = voice;
          u.onstart = () => { if (token === run) { if (state !== "paused") setState("speaking"); mark(i); } };
          u.onend = () => { if (token === run && state !== "idle") go(i + 1); };
          u.onerror = e => { if (token !== run || e.error === "interrupted" || e.error === "canceled") return; msg = "Your browser couldn't read this aloud."; setState("idle"); clearMark(); };
          synth.speak(u);
        };
        state = "starting"; render(); go(0);
      }
    }
    function pause() { if (engine === "claude") tts.pause().catch(() => {}); else { synth.pause(); setState("paused"); } }
    function resume() { if (engine === "claude") tts.resume().catch(() => {}); else { synth.resume(); setState("speaking"); } }
    function stop() {
      if (state === "idle") return;
      run++;
      if (engine === "claude") tts.stop().catch(() => {}); else synth.cancel();
      state = "idle"; clearMark(); render();
    }
    function setRate(r) {
      rate = r; store("ailearn_rate", r);
      if (engine === "claude") tts.setRate?.(r);
    }
    function render() {
      const bar = $("#listen-bar");
      if (!bar) return;
      if (!engine || disabled) { bar.hidden = true; return; }
      const hadFocus = bar.contains(document.activeElement);
      bar.hidden = false;
      const rates = [[0.8, "Slower"], [1, "Normal"], [1.2, "Faster"], [1.5, "Fastest"]];
      const speed = `<label class="listen-rate">Speed <select id="listen-rate">${rates.map(([v, l]) => `<option value="${v}"${v === rate ? " selected" : ""}>${l}</option>`).join("")}</select></label>`;
      bar.innerHTML = state === "idle"
        ? `<button class="listen-btn" data-listen>${icon("speaker", "ico-sm")} Listen to this lesson</button>${speed}<span class="listen-msg" role="status">${esc(msg)}</span>`
        : `${state === "paused" ? `<button class="listen-btn" data-listen-resume>${icon("play", "ico-sm")} Resume</button>` : `<button class="listen-btn" data-listen-pause>${icon("pause", "ico-sm")} Pause</button>`}
           <button class="listen-btn secondary" data-listen-stop>${icon("stop", "ico-sm")} Stop</button>${speed}
           <span class="listen-status" role="status">${state === "paused" ? "Paused" : state === "starting" ? "Starting…" : "Reading aloud"}</span>`;
      if (hadFocus) $("button", bar)?.focus();
    }
    return { start, pause, resume, stop, setRate, render, collect, active: () => state !== "idle", engine: () => engine, state: () => state };
  })();
  window.__reader = reader;
  view.addEventListener("change", e => { if (e.target.id === "listen-rate") reader.setRate(+e.target.value); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && reader.engine() === "browser") reader.stop(); });
  function openPathStep(k, opener) {
    const p = PATHS[myPath.id];
    if (!p.steps[k]) return;
    if (opener && !view.contains(opener)) lastFocus = opener;
    ctx = { kind: "path", idx: k };
    const { m, i } = ref(p.steps[k]);
    currentModule = m;
    openLesson(i);
  }
  const techReader = () => !!myPath && (myPath.id === "builder" || (myPath.answers || [])[1] >= 2);
  function openLesson(i) {
    reader.stop();
    currentLesson = i;
    const m = currentModule, l = m.lessons[i], done = progress[key(m.id, i)];
    const deep = (window.DEEPER || {})[`${m.id}-${i + 1}`];
    let nav, actions;
    if (ctx && ctx.kind === "path") {
      const p = PATHS[myPath.id], k = ctx.idx, last = k === p.steps.length - 1;
      nav = [`${p.name} · Module ${m.id}: ${m.title}`, `Step ${k + 1} of ${p.steps.length}`];
      actions = `${k > 0 ? `<button class="btn-secondary" data-pstep="${k - 1}">← Previous step</button>` : "<span></span>"}
        ${done ? `<button class="btn-main" ${last ? "data-pfinish" : `data-pstep="${k + 1}"`}>${last ? "Finish path →" : "Next step →"}</button>`
               : `<button class="btn-main" data-pcomplete>${last ? "Complete & finish path →" : "Mark complete & continue →"}</button>`}`;
    } else {
      const last = i === m.lessons.length - 1;
      nav = [`Module ${m.id}: ${m.title}`, `Lesson ${i + 1} of ${m.lessons.length}`];
      actions = `${i > 0 ? `<button class="btn-secondary" data-goto="${i - 1}">← Previous</button>` : "<span></span>"}
        ${done ? `<button class="btn-main" data-goto="${last ? "summary" : i + 1}">${last ? "Module summary →" : "Next lesson →"}</button>`
               : `<button class="btn-main" data-complete="${i}">${last ? "Complete module →" : "Mark complete & continue →"}</button>`}`;
    }
    $("#lesson-breadcrumb").textContent = nav[0];
    $("#lesson-progress-label").textContent = nav[1];
    $("#lesson-back").textContent = ctx ? "← Your path" : "← Lessons";
    $("#lesson-content").innerHTML = `
      <p class="lesson-eyebrow c-${m.color}">${icon("clock", "ico-sm")} ${l.read} min read · ${l.practice} min practice</p>
      <h2 tabindex="-1" id="lesson-heading">${esc(l.title)}</h2>
      <p class="lesson-intro">${esc(l.intro)}</p>
      <div class="listen" id="listen-bar" hidden></div>
      <div class="lesson-body">${l.content}</div>
      ${deep ? `<details class="deeper"${techReader() ? " open" : ""}><summary>${icon("code", "ico-sm")} Go deeper <span>· for technical readers</span></summary><p>${deep}</p></details>` : ""}
      ${l.tryIt ? `<section class="try-it" aria-label="Try it yourself">
        <div class="try-head">${icon("play", "ico-sm")} Try it yourself</div>
        <p class="try-tool">Open <strong>${esc(l.tryIt.tool)}</strong> and paste this:</p>
        <div class="try-prompt"><p id="try-text">${esc(l.tryIt.prompt)}</p>
        <button class="copy-btn" data-copy="#try-text">${icon("copy", "ico-sm")}<span>Copy</span></button></div>
        <p class="try-note">The Tools section links to each app. Most have a free plan.</p>
      </section>` : ""}
      ${l.quiz ? quizHtml(l.quiz, `q-${m.id}-${i}`, "Quick check: ") : ""}
      <div class="lesson-actions">${actions}</div>`;
    reader.render();
    mountDemos();
    closeModal(false);
    showView();
    $("#lesson-heading").focus({ preventScroll: true });
  }
  function closeLesson() {
    hideView();
    if (ctx) {
      ctx = null; renderPathBox();
      $("#path").scrollIntoView({ block: "start" });
      (lastFocus && document.contains(lastFocus) ? lastFocus : $("#path-title"))?.focus({ preventScroll: true });
    } else if (currentModule) openModule(currentModule.id);
  }
  $("#lesson-back").addEventListener("click", closeLesson);
  view.addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-cert-save]")) { saveCert(); return; }
    if (t.closest("[data-listen]")) { reader.start(); return; }
    if (t.closest("[data-listen-pause]")) { reader.pause(); return; }
    if (t.closest("[data-listen-resume]")) { reader.resume(); return; }
    if (t.closest("[data-listen-stop]")) { reader.stop(); $("[data-listen]", view)?.focus(); return; }
    if (t.closest("[data-pcomplete]")) {
      progress[key(currentModule.id, currentLesson)] = true; save(); updateProgressUI();
      const p = PATHS[myPath.id];
      ctx.idx + 1 < p.steps.length ? openPathStep(ctx.idx + 1) : openPathSummary();
      return;
    }
    const pst = t.closest("[data-pstep]");
    if (pst) { openPathStep(+pst.dataset.pstep); return; }
    if (t.closest("[data-pfinish]")) { openPathSummary(); return; }
    const ol = t.closest("[data-open-lesson]");
    if (ol) { const r = ref(ol.dataset.openLesson); ctx = null; currentModule = r.m; openLesson(r.i); return; }
    const c = t.closest("[data-complete]");
    if (c) {
      progress[key(currentModule.id, +c.dataset.complete)] = true;
      save(); updateProgressUI();
      const next = +c.dataset.complete + 1;
      next < currentModule.lessons.length ? openLesson(next) : openSummary();
      return;
    }
    const g = t.closest("[data-goto]");
    if (g) { g.dataset.goto === "summary" ? openSummary() : openLesson(+g.dataset.goto); return; }
    const nm = t.closest("[data-next-module]");
    if (nm) { ctx = null; currentModule = MODULES.find(m => m.id === +nm.dataset.nextModule); openLesson(0); return; }
    if (t.closest("[data-home]")) { ctx = null; hideView(); $("#modules").scrollIntoView({ block: "start" }); return; }
    if (t.closest("[data-path-home]")) { closeLesson(); }
  });

  // ---------- Certificates ----------
  let dl = null, currentCert = null, certCanvas = null, certTimer = null, certDraw = 0;
  (async () => { try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dl = null; } })();
  const certCard = c => `<div class="cert-card"><span class="cert-seal" aria-hidden="true">AI</span><div class="cert-card-text"><strong>You earned a certificate</strong><span>${esc(c.title)}</span></div><button class="btn-main" data-cert="${esc(c.id)}">View certificate →</button></div>`;
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
    line("AI UNLOCKED", '700 26px Literata, Georgia, serif', berry, 180, "8px");
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
  async function renderCertImage() {
    const c = currentCert, token = ++certDraw;
    const cv = await drawCert(c, certName || "");
    if (token !== certDraw || !$("#cert-img")) return;
    certCanvas = cv;
    $("#cert-img").src = cv.toDataURL("image/png");
    $("#cert-img").alt = `Certificate of completion for ${certName.trim() || "you"}: ${c.title}, ${fmtDate(c.date) || c.date}, certificate ID ${c.id}`;
    const btn = $("#cert-save"), note = $("#cert-note");
    if (!dl && inClaude) { btn.hidden = true; note.textContent = "To save it, right-click the certificate (or press and hold on a phone) and choose Save image."; return; }
    btn.hidden = false; btn.disabled = !certName.trim();
    if (!certName.trim()) note.textContent = "Add your name to save the certificate.";
    else if (/Add your name/.test(note.textContent)) note.textContent = "";
  }
  function openCertificate(id) {
    const c = certs.find(x => x.id === id); if (!c) return;
    reader.stop(); currentCert = c; ctx = { kind: "cert" };
    $("#lesson-breadcrumb").textContent = "Certificates";
    $("#lesson-progress-label").textContent = c.id;
    $("#lesson-back").textContent = "← Your path";
    $("#lesson-content").innerHTML = `
      <p class="lesson-eyebrow c-berry">${icon("check", "ico-sm")} Certificate earned</p>
      <h2 tabindex="-1" id="lesson-heading">Your certificate</h2>
      <p class="lesson-intro">Congratulations on completing ${esc(c.title)}. Type your name as you'd like it to appear, then save the certificate as an image.</p>
      <div class="cert-form"><label for="cert-name">Your name</label><input id="cert-name" type="text" maxlength="60" autocomplete="name" placeholder="Your full name" value="${esc(certName)}"></div>
      <figure class="cert-figure"><img id="cert-img" alt="Certificate of completion"></figure>
      <div class="cert-actions"><button class="btn-main" id="cert-save" data-cert-save>Save certificate (PNG)</button><p class="cert-note" id="cert-note" role="status"></p></div>`;
    showView(); renderCertImage();
    $("#lesson-heading").focus({ preventScroll: true });
  }
  async function saveCert() {
    const note = $("#cert-note");
    if (!certName.trim() || !certCanvas) { note.textContent = "Add your name to save the certificate."; return; }
    const blob = await new Promise(r => certCanvas.toBlob(r, "image/png"));
    const filename = `AI Unlocked certificate - ${certName.trim()}.png`.replace(/[\\/:*?"<>|]/g, "");
    if (!dl) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename; a.hidden = true; a.setAttribute("aria-label", "Download certificate");
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      note.textContent = "Downloaded. Check your Downloads folder.";
      return;
    }
    try { await dl.save({ filename, data: blob }); note.textContent = "Saved."; }
    catch (err) {
      const code = err && err.code;
      if (code === "declined") note.textContent = "Download cancelled.";
      else if (code === "rate_limited") note.textContent = "Another download is waiting for your answer. Try again in a moment.";
      else { dl = null; renderCertImage(); }
    }
  }
  view.addEventListener("input", e => {
    if (e.target.id !== "cert-name") return;
    certName = e.target.value.slice(0, 60);
    clearTimeout(certTimer);
    certTimer = setTimeout(() => { save(); renderCertImage(); }, 300);
  });

  function openPathSummary() {
    reader.stop();
    const p = PATHS[myPath.id];
    const extra = MODULES.flatMap(m => m.lessons.map((l, i) => ({ r: `${m.id}-${i + 1}`, m, l })))
      .filter(x => !p.steps.includes(x.r) && !progress[key(x.m.id, +x.r.split("-")[1] - 1)]).slice(0, 5);
    ctx = { kind: "path", idx: p.steps.length - 1 };
    $("#lesson-breadcrumb").textContent = p.name;
    $("#lesson-progress-label").textContent = "Path complete";
    $("#lesson-back").textContent = "← Your path";
    $("#lesson-content").innerHTML = `
      <p class="lesson-eyebrow c-berry">${icon("check", "ico-sm")} Path complete</p>
      <h2 tabindex="-1" id="lesson-heading">You finished “${esc(p.name)}”</h2>
      <p class="lesson-intro">You worked through ${p.steps.length} lessons. The best next step is to keep using AI tools for real tasks, a little at a time.</p>
      ${(c => c ? certCard(c) : "")(certs.find(c => c.kind === "path" && c.pathId === myPath.id))}
      ${extra.length ? `<h3 class="sub">Lessons you haven't read yet</h3>
      <div class="lesson-list flat">${extra.map(x => `<button class="lesson-item" data-open-lesson="${x.r}"><span class="lesson-num c-${x.m.color}">${x.m.id}</span><span class="lesson-info"><strong>${esc(x.l.title)}</strong><span>Module ${x.m.id}: ${esc(x.m.title)}</span></span><span class="lesson-time">${x.l.time} min</span></button>`).join("")}</div>` : ""}
      <div class="lesson-actions"><span></span><button class="btn-main" data-path-home>Back to your path</button></div>`;
    showView();
    $("#lesson-heading").focus({ preventScroll: true });
  }

  function openSummary() {
    reader.stop();
    ctx = null;
    const m = currentModule, next = MODULES.find(x => x.id === m.id + 1);
    $("#lesson-breadcrumb").textContent = `Module ${m.id}: ${m.title}`;
    $("#lesson-progress-label").textContent = "Summary";
    $("#lesson-back").textContent = "← Lessons";
    $("#lesson-content").innerHTML = `
      <p class="lesson-eyebrow c-${m.color}">${icon("check", "ico-sm")} Module ${m.id} complete</p>
      <h2 tabindex="-1" id="lesson-heading">What you learned</h2>
      ${(c => c ? certCard(c) : "")(certs.find(c => c.kind === "course"))}
      <ul class="recap">${m.recap.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
      <section class="review" data-review>
        <h3>Review quiz</h3>
        <p class="review-intro">Answering again a little later helps it stick. The answers are in a new order.</p>
        ${m.lessons.map((l, i) => quizHtml(l.quiz, `r-${m.id}-${i}`, `${i + 1}. `)).join("")}
        <p class="review-score" role="status" aria-live="polite"></p>
      </section>
      <div class="lesson-actions">
        <button class="btn-secondary" data-goto="${m.lessons.length - 1}">← Last lesson</button>
        ${next ? `<button class="btn-main" data-next-module="${next.id}">${next.level === "Technical" ? "Optional next" : "Next"}: ${esc(next.title)} →</button>`
               : `<button class="btn-main" data-home>Back to all lessons</button>`}
      </div>`;
    showView();
    $("#lesson-heading").focus({ preventScroll: true });
  }
  function updateReviewScore(sec) {
    const blocks = $$(".quiz-block", sec), answered = blocks.filter(b => b.dataset.answered);
    if (answered.length < blocks.length) return;
    const right = blocks.filter(b => b.dataset.result === "right").length;
    $(".review-score", sec).textContent = right === blocks.length
      ? `${right} of ${blocks.length}. You've got this module down.`
      : `${right} of ${blocks.length}. Revisit the lessons for the ones you missed, then carry on.`;
  }

  // ---------- Copy ----------
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const el = $(b.dataset.copy), label = $("span", b);
    try { await navigator.clipboard.writeText(el.textContent); label.textContent = "Copied"; }
    catch (err) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = "Selected, press Ctrl/⌘ C"; }
    setTimeout(() => { label.textContent = "Copy"; }, 2500);
  });

  // ---------- Next-word demo ----------
  const NW = {
    start: "The cat sat on the",
    first: [["mat", 41], ["sofa", 19], ["floor", 15], ["roof", 9], ["keyboard", 6]],
    second: {
      mat: [["and", 38], [".", 30], ["purring", 14], ["all", 8]],
      sofa: [["and", 35], [".", 33], ["next", 12], ["all", 9]],
      floor: [[".", 40], ["and", 31], ["near", 10], ["by", 8]],
      roof: [[".", 36], ["and", 28], ["of", 20], ["all", 7]],
      keyboard: [[".", 34], ["and", 30], ["again", 18], ["while", 10]]
    }
  };
  function mountDemos() {
    const host = $('[data-demo="nextword"]', view);
    if (!host) return;
    let words = [];
    const draw = () => {
      const opts = words.length === 0 ? NW.first : words.length === 1 ? NW.second[words[0]] : null;
      const text = NW.start + words.map(w => (w === "." ? "." : " " + w)).join("");
      host.innerHTML = `<div class="nw">
        <div class="nw-label">The text so far</div>
        <p class="nw-text">${esc(text)}${opts ? '<span class="nw-cursor"> ▍</span>' : ""}</p>
        ${opts ? `<div class="nw-label">What the model predicts next. Click a word to add it.</div>
        <div class="nw-bars">${opts.map(([w, p]) => `<button class="nw-bar" data-w="${esc(w)}"><span class="nw-word">${w === "." ? "(full stop)" : esc(w)}</span><span class="nw-track"><span style="width:${p * 2}%"></span></span><span class="nw-pct">${p}%</span></button>`).join("")}</div>
        <p class="nw-note">A chatbot usually picks a likely word, with a little randomness so answers don't always come out the same.</p>`
        : `<p class="nw-note">That's the whole trick, repeated for every word of every answer. A real model weighs tens of thousands of possible next words each time.</p>
        <button class="btn-secondary nw-reset">Start again</button>`}
      </div>`;
    };
    host.addEventListener("click", e => {
      const b = e.target.closest(".nw-bar");
      if (b) { words.push(b.dataset.w); draw(); return; }
      if (e.target.closest(".nw-reset")) { words = []; draw(); }
    });
    draw();
  }

  // ---------- Tools & models catalog ----------
  const CATS = { chat: "Chat assistants", search: "Search", learning: "Learning", writing: "Writing & notes", image: "Images & design", video: "Video", audio: "Voice & music", code: "Coding" };
  let tools = [], models = [], filter = "all";
  const today = new Date();
  const isNew = d => { const t = Date.parse(d); return !isNaN(t) && (today - t) / 864e5 <= 60; };
  const hue = s => ["violet", "magenta", "berry", "coral", "crimson", "plum"][[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 6];

  function renderToolFilters() {
    const present = Object.keys(CATS).filter(c => tools.some(t => t.cat === c));
    if (filter !== "all" && !present.includes(filter)) filter = "all";
    $("#tools-filter").innerHTML = [["all", "All tools"], ...present.map(c => [c, CATS[c]])]
      .map(([c, l]) => `<button class="filter-btn${filter === c ? " active" : ""}" data-filter="${c}" aria-pressed="${filter === c}">${l}</button>`).join("");
  }
  $("#tools-filter").addEventListener("click", e => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    filter = b.dataset.filter; renderToolFilters(); renderTools();
  });
  function renderTools() {
    const list = tools.filter(t => filter === "all" || t.cat === filter)
      .sort((a, b) => (isNew(b.addedAt) - isNew(a.addedAt)) || a.name.localeCompare(b.name));
    $("#tools-grid").innerHTML = list.map(t => {
      const url = safeUrl(t.url);
      return `<article class="tool-card">
        <div class="tool-head">
          <div class="tool-mono c-${hue(t.name || "?")}" aria-hidden="true">${esc((t.name || "?").charAt(0))}</div>
          <div class="tool-title"><h4>${esc(t.name)}${isNew(t.addedAt) ? ' <span class="new-pill">New</span>' : ""}</h4><span class="tool-maker">${esc(t.maker)}</span></div>
        </div>
        <p class="tool-desc">${esc(t.desc)}</p>
        <dl class="tool-facts">
          ${t.bestFor ? `<div><dt>Best for</dt><dd>${esc(t.bestFor)}</dd></div>` : ""}
          ${t.price ? `<div><dt>Cost</dt><dd>${esc(t.price)}</dd></div>` : ""}
          ${t.start ? `<div><dt>First try</dt><dd>${esc(t.start)}</dd></div>` : ""}
        </dl>
        ${url ? `<a class="tool-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open ${esc(t.name)} ${icon("ext", "ico-sm")}</a>` : ""}
      </article>`;
    }).join("") || `<p class="empty">No tools in this category yet.</p>`;
  }

  const ERAS = [
    { to: 2020, label: "2017–2020", name: "Foundations" },
    { to: 2022, label: "2021–2022", name: "Scale changes everything" },
    { to: 2024, label: "2023–2024", name: "The generative AI boom" },
    { to: 2025, label: "2025", name: "Reasoning and agents" }
  ];
  function renderModels() {
    const groups = [];
    const maxYear = Math.max(...models.map(m => +m.year || 0));
    const sorted = [...models].sort((a, b) => (a.year - b.year) || String(a.name).localeCompare(b.name));
    for (const m of sorted) {
      const y = +m.year, era = ERAS.find(e => y <= e.to);
      const id = era ? era.label : String(y), name = era ? era.name : (y === maxYear ? "Current frontier" : "Recent");
      let g = groups.find(x => x.id === id);
      if (!g) groups.push(g = { id, name, items: [] });
      g.items.push(m);
    }
    $("#models-timeline").innerHTML = groups.map(g => `
      <section class="model-era">
        <h3 class="era-label"><span class="era-years">${esc(g.id)}</span> ${esc(g.name)}</h3>
        <div class="models-row">${g.items.map(m => `
          <article class="model-card${m.current ? " is-current" : ""}">
            <div class="model-card-top">
              <div><div class="model-name">${esc(m.name)}</div><div class="model-maker">${esc(m.maker)} · ${esc(m.year)}</div></div>
              <div class="model-badges">${m.current ? '<span class="model-badge current">In use today</span>' : ""}<span class="model-badge">${esc(m.kind)}</span></div>
            </div>
            <p class="model-desc">${esc(m.desc)}</p>
          </article>`).join("")}</div>
      </section>`).join("");
  }

  const setCatalogStatus = text => { $$(".catalog-status").forEach(el => { el.textContent = text; }); };
  const fmtDate = d => { const t = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d + "T12:00:00" : d); return isNaN(t) ? null : new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); };
  function applyCatalog(t, m, lastChecked, live) {
    if (t && t.length) { tools = t; renderToolFilters(); renderTools(); renderStats(tools.length); }
    if (m && m.length) { models = m; renderModels(); }
    const d = fmtDate(lastChecked);
    if (d) setCatalogStatus(live || !inClaude ? `Last checked ${d}` : `Saved list from ${d}`);
  }
  async function loadCatalog() {
    let snapshotDate = null;
    try {
      const c = await (await fetch("catalog.json")).json();
      snapshotDate = c.meta && c.meta.lastChecked;
      applyCatalog(c.tools, c.models, snapshotDate, false);
    } catch (e) { setCatalogStatus("The tools list couldn't load. Refresh the page to try again."); }
    let db = null;
    try { db = window.claude && window.claude.use ? await window.claude.use("db") : null; } catch (e) { db = null; }
    if (!db) return;
    let liveTools = null, liveModels = null, liveDate = null;
    const push = () => { if (liveTools || liveModels) applyCatalog(liveTools, liveModels, liveDate || snapshotDate, true); };
    const docsOf = s => s.docs.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() })).filter(x => x.name && x.status !== "hidden");
    db.collection("tools").onSnapshot(s => { if (!s.empty) { liveTools = docsOf(s); push(); } }, () => {});
    db.collection("models").onSnapshot(s => { if (!s.empty) { liveModels = docsOf(s); push(); } }, () => {});
    db.doc("meta/site").onSnapshot(s => { if (s.exists) { liveDate = s.data().lastChecked; push(); } }, () => {});
  }

  // ---------- Glossary ----------
  function renderGlossary() {
    const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
    $("#glossary-grid").innerHTML = sorted.map(g => `<div class="glossary-item"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join("");
    $("#glossary-count").textContent = `${sorted.length} terms`;
    $("#glossary-search").addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase();
      let shown = 0;
      $$(".glossary-item").forEach((el, i) => {
        const hit = !q || sorted[i].term.toLowerCase().includes(q) || sorted[i].def.toLowerCase().includes(q);
        el.hidden = !hit; if (hit) shown++;
      });
      $("#glossary-count").textContent = q ? `${shown} of ${sorted.length} terms` : `${sorted.length} terms`;
      $("#glossary-empty").hidden = shown > 0;
    });
  }

  // ---------- Mobile menu & keys ----------
  const menuBtn = $("#menu-btn"), menu = $("#nav-links");
  menuBtn.addEventListener("click", () => { const open = menu.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", open); });
  menu.addEventListener("click", e => { if (e.target.closest("a")) { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!view.hidden && reader.active()) { if (reader.engine() === "browser") reader.stop(); return; }
    if (!view.hidden) closeLesson();
    else if (!$("#modal-overlay").hidden) closeModal();
    else if (menu.classList.contains("open")) { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
  });

  // ---------- Sync across devices (signed-in viewers) ----------
  const sync = (() => {
    let docRef = null, status = "starting", ready = false, writing = false, again = false, timer = null, lastJson = "";
    const MSG = {
      starting: "",
      local: "Your progress is saved in this browser, on this device.",
      synced: "Your progress is saved to your Claude account, so it follows you to any device where you're signed in.",
      signedout: "Your progress is saved in this browser. Sign in to claude.ai to keep it in sync across your devices.",
      noaccess: "Your progress is saved in this browser. Syncing across devices isn't available for your account on this site.",
      unavailable: "Your progress is saved in this browser. Syncing to your account isn't available right now."
    };
    function setStatus(s) { status = s; const el = $("#sync-status"); if (el) { el.textContent = MSG[s] || ""; el.dataset.state = s; } }
    const payload = () => ({ progress, path: myPath, certs, name: certName || "" });
    function merge(remote) {
      let changed = false;
      const rp = remote.progress && typeof remote.progress === "object" ? remote.progress : {};
      for (const [k, v] of Object.entries(rp)) {
        if (!/^\d+_\d+$/.test(k) || !(v === true || v === "known")) continue;
        if (progress[k] !== true && progress[k] !== v) { progress[k] = v; changed = true; }
      }
      const localUpdated = +load("ailearn_updated_v1", 0) || 0;
      const rpath = remote.path && PATHS[remote.path.id] ? remote.path : null;
      if (rpath && (!myPath || (+remote.updatedAt || 0) > localUpdated) && JSON.stringify(rpath) !== JSON.stringify(myPath)) { myPath = rpath; changed = true; }
      for (const c of Array.isArray(remote.certs) ? remote.certs : []) {
        if (c && typeof c.id === "string" && typeof c.title === "string" && !certs.some(x => x.id === c.id || (x.kind === c.kind && x.pathId === c.pathId))) { certs.push(c); changed = true; }
      }
      if (!certName && typeof remote.name === "string" && remote.name) { certName = remote.name.slice(0, 60); changed = true; }
      if (changed) {
        writeLocal();
        if (myPath && quiz.active && quiz.step === 0 && !quiz.answers.length) quiz.active = false;
        updateProgressUI();
      }
      return changed;
    }
    async function init() {
      try {
        if (!inClaude) { setStatus("local"); return; }
        const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
        const id = user ? await user.id() : null;
        if (!db || !id) { setStatus("signedout"); return; }
        docRef = db.doc(`data/users/${id}/learner`);
        const t = setTimeout(() => { if (!ready) setStatus("unavailable"); }, 10000);
        docRef.onSnapshot(snap => {
          if (snap.metadata.hasPendingWrites) return;
          if (snap.metadata.fromCache && !ready) { if (snap.exists) merge(snap.data()); return; }
          clearTimeout(t);
          if (snap.exists) merge(snap.data());
          if (!ready) { ready = true; push(true); }
        }, () => { clearTimeout(t); docRef = null; setStatus("unavailable"); });
      } catch (e) { setStatus("unavailable"); }
    }
    function push(now) {
      if (!docRef || !ready) return;
      clearTimeout(timer);
      timer = setTimeout(write, now ? 0 : 1200);
    }
    async function write() {
      const data = payload(), json = JSON.stringify(data);
      if (json === lastJson) { if (status !== "noaccess") setStatus("synced"); return; }
      if (writing) { again = true; return; }
      writing = true;
      try { await docRef.set({ ...data, updatedAt: Date.now() }); lastJson = json; setStatus("synced"); }
      catch (err) { setStatus(err && err.code === "invalid_argument" ? "noaccess" : "unavailable"); if (err && err.code === "invalid_argument") docRef = null; }
      finally { writing = false; if (again) { again = false; push(true); } }
    }
    return { init, push, status: () => status, merge };
  })();
  window.__sync = sync;

  // ---------- Init ----------
  renderStats(null);
  updateProgressUI();
  renderGlossary();
  loadCatalog();
  sync.init();
})();
