const container = document.getElementById("music-list");

let currentAudio = null;
let currentBlock = null;
let openedLyrics = null;
let openedButton = null;

// створення карток
songs.forEach(song => {
  const card = document.createElement("div");
  card.className = "song-card";

  card.innerHTML = `
    <div class="flex">
        <img src="${song.cover}">
        <h3>${song.title}</h3>
    </div>
    

    <button class="toggle-text">Show text</button>

    <div class="lyrics hidden">
        <div class="lyrics-text">
            ${song.lyrics}
        </div>
    </div>

    <audio src="${song.audio}"></audio>
  `;

  container.appendChild(card);
});

// логіка кліків
document.addEventListener("click", e => {
  const card = e.target.closest(".song-card");
  const isClickInsideLyrics = e.target.closest(".lyrics");

  // ====== Клік поза lyrics ======
  if (openedLyrics && !isClickInsideLyrics && !e.target.classList.contains("toggle-text")) {
    openedLyrics.classList.add("hidden");
    if (openedButton) openedButton.textContent = "Show text";
    openedLyrics = null;
    openedButton = null;
  }

  if (!card) return;

  const audio = card.querySelector("audio");
  const lyrics = card.querySelector(".lyrics");
  const btn = card.querySelector(".toggle-text");

  // ====== Кнопка toggle ======
  if (e.target.classList.contains("toggle-text")) {

    // якщо відкритий інший текст — закриваємо його
    if (openedLyrics && openedLyrics !== lyrics) {
      openedLyrics.classList.add("hidden");
      if (openedButton) openedButton.textContent = "Show text";
    }

    // відкриваємо або ховаємо поточний
    lyrics.classList.toggle("hidden");
    if (lyrics.classList.contains("hidden")) {
      btn.textContent = "Show text";
      openedLyrics = null;
      openedButton = null;
    } else {
      btn.textContent = "Hide text";
      openedLyrics = lyrics;
      openedButton = btn;
    }

    return;
  }

  // ====== Якщо інша пісня ======
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentBlock.classList.remove("playing");
  }

  // ====== Play / Pause ======
  if (audio.paused) {
    audio.play();
    card.classList.add("playing");
    currentAudio = audio;
    currentBlock = card;

    // Автовідкриття тексту при запуску пісні
    if (openedLyrics && openedLyrics !== lyrics) {
      openedLyrics.classList.add("hidden");
      if (openedButton) openedButton.textContent = "Show text";
    }

    lyrics.classList.remove("hidden");
    btn.textContent = "Hide text";
    openedLyrics = lyrics;
    openedButton = btn;

  } else {
    audio.pause();
    card.classList.remove("playing");
  }
});
