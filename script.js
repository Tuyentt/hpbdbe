const openBtn = document.getElementById("openBtn");
const bgMusic = document.getElementById("bgMusic");
const cakeMusic = document.getElementById("cakeMusic");
let activeMusic = bgMusic;
const musicToggle = document.getElementById("musicToggle");
const dontClickBtn = document.getElementById("dontClickBtn");
const easterText = document.getElementById("easterText");
const giftResult = document.getElementById("giftResult");
const selectedGift = document.getElementById("selectedGift");
const selectedGiftImage = document.getElementById("selectedGiftImage");
const selectedGiftCategory = document.getElementById("selectedGiftCategory");
const confirmGift = document.getElementById("confirmGift");
const giftConfirmNote = document.getElementById("giftConfirmNote");
const finalSurprise = document.getElementById("finalSurprise");
const finalText = document.getElementById("finalText");
const confettiLayer = document.getElementById("confettiLayer");

let easterClicks = 0;
let currentGift = null;



/* =========================================================
   PASSWORD GATE
   Added to user's ver25082026 checkpoint.
========================================================= */
const passwordGate = document.getElementById("passwordGate");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");
const secureStatus = document.getElementById("secureStatus");
const PASSWORD_HASH = "a946e144e7c5dea3615396cad438ff120e48e0b61cf493c85bbeb8c52ee64634";

function normalizeBirthdayPassword(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

async function birthdaySha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    const cleaned = normalizeBirthdayPassword(passwordInput.value);
    if (passwordInput.value !== cleaned) passwordInput.value = cleaned;
    passwordInput.classList.remove("is-wrong");
    if (passwordError) passwordError.textContent = "";
  });
}

if (passwordForm) {
  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const answer = normalizeBirthdayPassword(passwordInput.value);

    if (answer.length !== 8) {
      passwordError.textContent = "INVALID FORMAT — 8 DIGITS REQUIRED";
      if (secureStatus) secureStatus.textContent = "DENIED";
      passwordInput.classList.add("is-wrong");
      passwordInput.focus();
      return;
    }

    try {
      const answerHash = await birthdaySha256(answer);

      if (answerHash !== PASSWORD_HASH) {
        passwordError.textContent = "ACCESS DENIED — INCORRECT CODE";
        if (secureStatus) secureStatus.textContent = "DENIED";
        passwordInput.classList.remove("is-wrong");
        void passwordInput.offsetWidth;
        passwordInput.classList.add("is-wrong");
        passwordInput.select();
        return;
      }

      passwordError.textContent = "ACCESS GRANTED";
      if (secureStatus) secureStatus.textContent = "GRANTED";
      passwordGate.classList.add("access-granted");
      passwordInput.blur();

      const existingIntro = document.getElementById("introOverlay");
      if (existingIntro) {
        existingIntro.classList.remove("password-locked");
      }

      passwordGate.classList.add("is-unlocking");

      setTimeout(() => {
        if (passwordGate && passwordGate.parentNode) passwordGate.remove();

        // Start existing line-by-line intro animation if the project has it
        // and if it has not already started.
        if (typeof startIntroAnimation === "function") {
          startIntroAnimation();
        }
      }, 500);

    } catch (error) {
      console.error("Password check failed:", error);
      passwordError.textContent = "SYSTEM ERROR — RETRY";
      if (secureStatus) secureStatus.textContent = "ERROR";
    }
  });
}


/* =========================================================
   INTRO POPUP
========================================================= */
const introOverlay = document.getElementById("introOverlay");
const introOpenBtn = document.getElementById("introOpenBtn");
const siteContent = document.getElementById("siteContent");
const introLines = [...document.querySelectorAll(".intro-line")];

document.body.classList.add("intro-open");

let introAnimationStarted = false;

function startIntroAnimation() {
  if (introAnimationStarted) return;
  introAnimationStarted = true;

  const introDelays = [350, 1250, 2350, 3000, 4050];
  introLines.forEach((line, i) => {
    setTimeout(() => line.classList.add("show"), introDelays[i] || 0);
  });
}

introOpenBtn.addEventListener("click", () => {
  // IMPORTANT:
  // Reveal the website FIRST. Audio must never block the page opening.
  siteContent.classList.remove("site-content-hidden");
  siteContent.classList.add("site-content-visible");

  introOverlay.classList.add("is-closing");
  document.body.classList.remove("intro-open");

  // Start music in parallel from the user's click.
  // If the file is missing / invalid / blocked, the website still opens normally.
  try {
    bgMusic.currentTime = 0;
    const playPromise = bgMusic.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          musicToggle.classList.add("playing");
          musicToggle.textContent = "❚❚";
        })
        .catch((e) => {
          console.log("Music could not start:", e);
          musicToggle.classList.remove("playing");
          musicToggle.textContent = "♫";
        });
    }
  } catch (e) {
    console.log("Music could not start:", e);
  }

  setTimeout(() => {
    if (introOverlay && introOverlay.parentNode) {
      introOverlay.remove();
    }
  }, 800);

  // Slight delay makes the reveal feel smoother.
  setTimeout(() => burstConfetti(36), 180);
});

if (openBtn) openBtn.addEventListener("click", async () => {
  document.querySelectorAll(".reveal")[0]?.scrollIntoView({ behavior: "smooth" });
  try {
    await bgMusic.play();
    musicToggle.classList.add("playing");
    musicToggle.textContent = "❚❚";
  } catch (e) {}
  burstConfetti(30);
});

if (musicToggle) musicToggle.addEventListener("click", async () => {
  const track = activeMusic || bgMusic;
  if (!track) return;

  if (track.paused) {
    try {
      await track.play();
      musicToggle.classList.add("playing");
      musicToggle.textContent = "❚❚";
    } catch (e) {
      const wantedFile = track === cakeMusic
        ? "music/cake-song.mp3"
        : "music/our-song.mp3";
      alert(`Hãy thêm file ${wantedFile} để bật nhạc nhé.`);
    }
  } else {
    track.pause();
    musicToggle.classList.remove("playing");
    musicToggle.textContent = "♫";
  }
});

if (dontClickBtn) dontClickBtn.addEventListener("click", () => {
  easterClicks += 1;
  const messages = [
    "Anh biết ngay là bé sẽ bấm mà. 😑",
    "Seriously?",
    "bé vẫn bấm tiếp à? 😂",
    "Fine… I love you. ❤️"
  ];
  easterText.textContent = messages[Math.min(easterClicks - 1, messages.length - 1)];
  if (easterClicks >= 4) burstConfetti(42);
});

/* =========================================================
   DYNAMIC CONTENT
   Generated by UPDATE_CONTENT.bat -> data/content.js
========================================================= */
const CONTENT = window.BIRTHDAY_CONTENT || { memories: [], giftCategories: [] };

/* MEMORIES — horizontal swipe */
const memoryCarousel = document.getElementById("memoryCarousel");
const currentMemory = document.getElementById("currentMemory");
const totalMemory = document.getElementById("totalMemory");
const memoryDots = document.getElementById("memoryDots");
const swipeHint = document.getElementById("swipeHint");

function renderMemories() {
  memoryCarousel.innerHTML = "";
  memoryDots.innerHTML = "";

  const memories = CONTENT.memories || [];
  totalMemory.textContent = memories.length;
  currentMemory.textContent = memories.length ? 1 : 0;

  if (!memories.length) {
    memoryCarousel.innerHTML = `
      <div class="empty-content">
        Chưa có ảnh trong thư mục <b>memories</b>.<br>
        Thêm ảnh rồi chạy <b>UPDATE_CONTENT.bat</b>.
      </div>`;
    swipeHint.textContent = "";
    return;
  }

  memories.forEach((item, i) => {
    const card = document.createElement("article");
    card.className = "memory-slide" + (i === 0 ? " active" : "");
    card.dataset.index = i;

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title || `Kỷ niệm ${i + 1}`;

    const overlay = document.createElement("div");
    overlay.className = "memory-overlay";

    const chapter = document.createElement("span");
    chapter.textContent = item.chapter || `Chapter ${String(i + 1).padStart(2, "0")}`;

    const title = document.createElement("h3");
    title.textContent = item.title || `Memory ${i + 1}`;

    const meta = document.createElement("div");
    meta.className = "memory-meta";
    const metaParts = [];
    if (item.date) metaParts.push(item.date);
    if (item.location) metaParts.push(item.location);
    meta.textContent = metaParts.join(" · ");

    const desc = document.createElement("p");
    desc.textContent = item.description || "";

    overlay.append(chapter, title);
    if (metaParts.length) overlay.appendChild(meta);
    overlay.appendChild(desc);
    card.append(img, overlay);
    memoryCarousel.appendChild(card);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "memory-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Xem kỷ niệm ${i + 1}`);
    dot.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    memoryDots.appendChild(dot);
  });
}

renderMemories();

function getMemorySlides() {
  return [...document.querySelectorAll(".memory-slide")];
}
function getMemoryDots() {
  return [...document.querySelectorAll(".memory-dot")];
}

let memoryActiveIndex = 0;
let memoryScrollTimer = null;

function setActiveMemory(index) {
  const memorySlides = getMemorySlides();
  const dots = getMemoryDots();
  if (!memorySlides.length) return;

  index = Math.max(0, Math.min(index, memorySlides.length - 1));
  if (index === memoryActiveIndex &&
      memorySlides[index].classList.contains("active")) return;

  memoryActiveIndex = index;

  memorySlides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  currentMemory.textContent = index + 1;

  swipeHint.style.opacity = index > 0 ? "0.35" : "";
  swipeHint.textContent =
    index === memorySlides.length - 1
      ? "Đã xem hết album ❤️"
      : "← vuốt để lật trang →";
}

function findNearestMemory() {
  const slides = getMemorySlides();
  if (!slides.length) return;

  const carouselCenter =
    memoryCarousel.scrollLeft + memoryCarousel.clientWidth / 2;

  let nearestIndex = 0;
  let nearestDistance = Infinity;

  for (let i = 0; i < slides.length; i++) {
    const center = slides[i].offsetLeft + slides[i].offsetWidth / 2;
    const distance = Math.abs(center - carouselCenter);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  setActiveMemory(nearestIndex);
}

/*
  PERFORMANCE STRATEGY:
  - Do not animate every pixel of the swipe.
  - Let the browser handle native scrolling entirely.
  - Only update the active card after the finger/scroll slows down.
*/
memoryCarousel.addEventListener("scroll", () => {
  clearTimeout(memoryScrollTimer);
  memoryScrollTimer = setTimeout(findNearestMemory, 70);
}, { passive: true });

// Modern browsers: react immediately when native scrolling finishes.
if ("onscrollend" in window) {
  memoryCarousel.addEventListener("scrollend", findNearestMemory, { passive: true });
}

// Initial state + resize.
requestAnimationFrame(() => {
  setActiveMemory(0);
  findNearestMemory();
});

let memoryResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(memoryResizeTimer);
  memoryResizeTimer = setTimeout(findNearestMemory, 150);
}, { passive: true });

/* GIFTS — generated from /gifts folders */
const categoryTabs = document.getElementById("categoryTabs");
const productGrid = document.getElementById("productGrid");

function renderGiftTabs() {
  categoryTabs.innerHTML = "";
  const cats = CONTENT.giftCategories || [];

  if (!cats.length) {
    categoryTabs.innerHTML = `<span class="empty-inline">Chưa có category quà</span>`;
    productGrid.innerHTML = `
      <div class="empty-content">
        Chưa có quà trong thư mục <b>gifts</b>.<br>
        Tạo folder category, thêm ảnh + file .txt, rồi chạy <b>UPDATE_CONTENT.bat</b>.
      </div>`;
    return;
  }

  cats.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (i === 0 ? " active" : "");
    btn.dataset.category = cat.key;
    btn.textContent = `${cat.emoji || "🎁"} ${cat.label}`;
    btn.addEventListener("click", () => {
      [...categoryTabs.querySelectorAll(".category-tab")].forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      renderCategory(cat.key);
    });
    categoryTabs.appendChild(btn);
  });

  renderCategory(cats[0].key);
}

function renderCategory(categoryKey) {
  const category = (CONTENT.giftCategories || []).find(c => c.key === categoryKey);
  if (!category) return;

  productGrid.innerHTML = "";
  productGrid.scrollLeft = 0;
  giftResult.classList.add("hidden");
  currentGift = null;

  category.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "product-card";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    const info = document.createElement("div");
    info.className = "product-info";

    const strong = document.createElement("strong");
    strong.textContent = item.name;

    const small = document.createElement("small");
    small.textContent = item.note || "";

    info.append(strong, small);
    btn.append(img, info);

    btn.addEventListener("click", () => {
      document.querySelectorAll(".product-card").forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");

      currentGift = {
        ...item,
        category: category.label
      };

      selectedGift.textContent = item.name;
      selectedGiftImage.src = item.image;
      selectedGiftImage.alt = item.name;
      selectedGiftCategory.textContent = category.label;
      giftResult.classList.remove("hidden");
      giftConfirmNote.textContent = "";
      giftResult.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    productGrid.appendChild(btn);
  });
}

renderGiftTabs();

if (confirmGift) confirmGift.addEventListener("click", () => {
  if (!currentGift) return;
  localStorage.setItem("birthdayGiftChoice", JSON.stringify(currentGift));
  giftConfirmNote.textContent = `Đã chốt: ${currentGift.name} (${currentGift.category}). Chụp màn hình đoạn này gửi anh nhé 😌`;
  burstConfetti(55);
});




/* =========================================================
   TWO-STAGE BACKGROUND MUSIC
========================================================= */
function setMusicTogglePlaying(isPlaying) {
  if (!musicToggle) return;
  musicToggle.classList.toggle("playing", isPlaying);
  musicToggle.textContent = isPlaying ? "❚❚" : "♫";
}

function fadeOutAudio(audio, duration = 650) {
  return new Promise(resolve => {
    if (!audio || audio.paused) {
      resolve();
      return;
    }

    const startVolume = Number.isFinite(audio.volume) ? audio.volume : 1;
    const startedAt = performance.now();

    function step(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      audio.volume = Math.max(0, startVolume * (1 - progress));

      if (progress >= 1) {
        audio.pause();
        audio.volume = startVolume;
        resolve();
        return;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

async function switchToCakeMusic() {
  activeMusic = cakeMusic || bgMusic;

  if (bgMusic && bgMusic !== cakeMusic) {
    await fadeOutAudio(bgMusic, 650);
  }

  if (!cakeMusic) {
    setMusicTogglePlaying(false);
    return;
  }

  try {
    cakeMusic.currentTime = 0;
    cakeMusic.volume = 1;
    await cakeMusic.play();
    setMusicTogglePlaying(true);
  } catch (e) {
    console.log("Cake music could not start:", e);
    setMusicTogglePlaying(false);
  }
}

/* =========================================================
   ONE LAST SURPRISE — HOLD TO BLOW OUT NUMBER 26 CANDLES
========================================================= */
const cakeSurprise = document.getElementById("cakeSurprise");
const cakeStage = document.getElementById("cakeStage");
const candles = document.getElementById("candles");
const birthdayWish = document.getElementById("birthdayWish");
const cakeActionTitle = document.getElementById("cakeActionTitle");
const cakeActionCopy = document.getElementById("cakeActionCopy");
const holdBlowBtn = document.getElementById("holdBlowBtn");
const holdProgress = document.getElementById("holdProgress");
const holdButtonText = document.getElementById("holdButtonText");
const holdNote = document.getElementById("holdNote");

let birthdayBlown = false;
let holdIsActive = false;
let holdStartedAt = 0;
let holdFrame = 0;

const HOLD_DURATION = 1900;

function resetBirthdayHold() {
  holdIsActive = false;

  if (holdFrame) {
    cancelAnimationFrame(holdFrame);
    holdFrame = 0;
  }

  if (holdBlowBtn) {
    holdBlowBtn.classList.remove("holding");
  }

  if (!birthdayBlown && holdProgress) {
    holdProgress.style.width = "0%";
  }

  if (!birthdayBlown && holdButtonText) {
    holdButtonText.textContent = "💨 Nhấn & giữ để thổi nến";
  }
}

function finishBirthdayCandles() {
  if (birthdayBlown) return;

  birthdayBlown = true;
  holdIsActive = false;

  if (holdFrame) {
    cancelAnimationFrame(holdFrame);
    holdFrame = 0;
  }

  if (holdProgress) holdProgress.style.width = "100%";

  if (holdBlowBtn) {
    holdBlowBtn.classList.remove("holding");
    holdBlowBtn.disabled = true;
  }

  if (holdButtonText) {
    holdButtonText.textContent = "Nến tắt rồi! 🎉";
  }

  if (candles) candles.classList.add("blown");
  if (cakeStage) cakeStage.classList.add("blown");
  const cakeSection = document.getElementById("birthdayCakeSection");
  if (cakeSection) cakeSection.classList.add("candles-out");

  if (cakeActionTitle) {
    cakeActionTitle.textContent = "Điều ước đã được gửi đi rồi ❤️";
  }

  if (cakeActionCopy) {
    cakeActionCopy.textContent = "Happy Birthday, bé!";
  }

  if (holdNote) holdNote.classList.add("hidden");
  if (birthdayWish) birthdayWish.classList.remove("hidden");

  if (typeof burstConfetti === "function") {
    burstConfetti(120);
    setTimeout(() => burstConfetti(70), 650);
  }
}

function animateBirthdayHold(now) {
  if (!holdIsActive || birthdayBlown) return;

  const elapsed = now - holdStartedAt;
  const progress = Math.min(elapsed / HOLD_DURATION, 1);

  if (holdProgress) {
    holdProgress.style.width = `${progress * 100}%`;
  }

  if (progress >= 1) {
    finishBirthdayCandles();
    return;
  }

  holdFrame = requestAnimationFrame(animateBirthdayHold);
}

function beginBirthdayHold(event) {
  if (birthdayBlown || holdIsActive) return;

  event.preventDefault();
  holdIsActive = true;
  holdStartedAt = performance.now();

  if (holdBlowBtn) holdBlowBtn.classList.add("holding");
  if (holdButtonText) holdButtonText.textContent = "Giữ thêm chút nữa… 💨";

  holdFrame = requestAnimationFrame(animateBirthdayHold);
}

function endBirthdayHold(event) {
  if (birthdayBlown) return;
  if (event) event.preventDefault();
  resetBirthdayHold();
}

if (finalSurprise) {
  finalSurprise.addEventListener("click", () => {
    const cakeSection = document.getElementById("birthdayCakeSection");

    // Turn the "room lights" off first.
    document.body.classList.add("cake-night-mode");
    if (cakeSection) cakeSection.classList.add("cake-night-active");

    // Show the cake scene.
    finalSurprise.classList.add("hidden");
    if (cakeSurprise) cakeSurprise.classList.remove("hidden");

    // Song 1 -> Song 2.
    switchToCakeMusic();

    if (cakeSection) cakeSection.scrollTop = 0;
  });
}

if (holdBlowBtn) {
  holdBlowBtn.addEventListener("pointerdown", beginBirthdayHold);
  holdBlowBtn.addEventListener("pointerup", endBirthdayHold);
  holdBlowBtn.addEventListener("pointercancel", endBirthdayHold);
  holdBlowBtn.addEventListener("pointerleave", endBirthdayHold);

  holdBlowBtn.addEventListener("keydown", event => {
    if ((event.key === " " || event.key === "Enter") && !holdIsActive) {
      beginBirthdayHold(event);
    }
  });

  holdBlowBtn.addEventListener("keyup", event => {
    if (event.key === " " || event.key === "Enter") {
      endBirthdayHold(event);
    }
  });
}



/* =========================================================
   iOS SAFARI LONG-PRESS / IMAGE CALLOUT GUARD
========================================================= */
function isCakeNightModeActive() {
  return document.body.classList.contains("cake-night-mode");
}

document.addEventListener("contextmenu", event => {
  if (isCakeNightModeActive()) {
    event.preventDefault();
  }
}, { capture: true });

document.addEventListener("dragstart", event => {
  if (isCakeNightModeActive()) {
    event.preventDefault();
  }
}, { capture: true });

if (holdBlowBtn) {
  holdBlowBtn.addEventListener("touchstart", event => {
    event.preventDefault();
  }, { passive: false });

  holdBlowBtn.addEventListener("touchend", event => {
    event.preventDefault();
  }, { passive: false });

  holdBlowBtn.addEventListener("touchcancel", event => {
    event.preventDefault();
  }, { passive: false });
}


function burstConfetti(count = 40) {
  const icons = ["❤️", "✨", "🎉", "💗", "🌸"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "confetti";
    el.textContent = icons[Math.floor(Math.random() * icons.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.animationDuration = `${2.8 + Math.random() * 3.2}s`;
    el.style.animationDelay = `${Math.random() * .4}s`;
    el.style.fontSize = `${12 + Math.random() * 15}px`;
    confettiLayer.appendChild(el);
    setTimeout(() => el.remove(), 7000);
  }
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
