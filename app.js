// --- Глобальні змінні ---
const musicList = document.getElementById('music-list');
const categoryTabs = document.getElementById('category-tabs');
const queueButton = document.getElementById('queue-button');
const queuePopup = document.getElementById('queue-popup');
const queueList = document.getElementById('queue-list');
const clearQueueBtn = document.getElementById('clear-queue');
const playQueueBtn = document.getElementById('play-queue');

const player = document.getElementById('player');
const playerTitle = document.getElementById('player-title');
const playerStart = document.getElementById('player-start');
const playerPlay = document.getElementById('player-play');
const playerLyricsBtn = document.getElementById('player-lyrics');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const timeline = document.getElementById('timeline');

let currentAudio = new Audio();
let activeSong = null;
let queue = JSON.parse(localStorage.getItem('musicQueue')) || [];
let isPlayingQueue = false;

// --- Попап тексту ---
const lyricsPopup = document.createElement('div');
lyricsPopup.id = 'lyrics-popup';
lyricsPopup.className = 'queue-popup hidden';
lyricsPopup.innerHTML = `<h2>Текст пісні</h2><div id="lyrics-content"></div>`;
document.body.appendChild(lyricsPopup);
const lyricsContent = document.getElementById('lyrics-content');

// --- Категорії ---
const categories = ['All', ...new Set(songs.map(s => s.categoria))];
categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSongs(cat);
    });
    if(cat === 'All') btn.classList.add('active');
    categoryTabs.appendChild(btn);
});

// --- Відображення пісень ---

function renderSongs(category = 'All') {
    musicList.innerHTML = '';
    const filtered = category === 'All' ? songs : songs.filter(s => s.categoria === category);
    filtered.forEach(song => musicList.appendChild(createSongCard(song)));
}

// --- Створення картки пісні ---
function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
        <h3>${song.title}</h3>
        <div class="card-buttons">
            <button class="start-btn">⏮</button>
            <button class="play-btn">▶</button>
            <button class="queue-btn">+</button>
        </div>
    `;

    const playBtn = card.querySelector('.play-btn');
    const startBtn = card.querySelector('.start-btn');
    const queueBtn = card.querySelector('.queue-btn');



    // --- Кнопки ---
    playBtn.addEventListener('click', e => {
        e.stopPropagation();
        if(activeSong && activeSong.id === song.id && !currentAudio.paused){
            currentAudio.pause();
        } else {
            playSong(song);
            showLyrics(song);
        }
    });

    startBtn.addEventListener('click', e => {
        e.stopPropagation();
        if(activeSong && activeSong.id === song.id){
            currentAudio.currentTime = 0;
        } else {
            playSong(song);
            currentAudio.currentTime = 0;
            showLyrics(song);
        }
    });

    queueBtn.addEventListener('click', e => {
        e.stopPropagation();
        addToQueue(song);
    });

    return card;
}

// --- Відтворення пісні ---
function playSong(song){
    if(activeSong && activeSong.id !== song.id) currentAudio.pause();

    activeSong = song;
    currentAudio.src = song.audio;
    currentAudio.play();
    playerCover.src = song.cover;
    playerTitle.textContent = song.title;
    playerPlay.textContent = '⏸';

    currentAudio.addEventListener('timeupdate', updateTimeline);
    currentAudio.addEventListener('ended', () => {
        if(isPlayingQueue) playNextInQueue();
    });
}

// --- Нижній плеєр ---
playerPlay.addEventListener('click', () => {
    if(currentAudio.paused){
        currentAudio.play();
        playerPlay.textContent = '⏸';
    } else {
        currentAudio.pause();
        playerPlay.textContent = '▶';
    }
});
playerStart.addEventListener('click', () => {
    if(activeSong) currentAudio.currentTime = 0;
});
timeline.addEventListener('input', () => {
    if(currentAudio.duration){
        currentAudio.currentTime = (timeline.value/100)*currentAudio.duration;
    }
});

// --- Кнопка тексту в плеєрі ---
playerLyricsBtn.addEventListener('click', () => {
    if(activeSong){
        if(lyricsPopup.classList.contains('hidden')){
            showLyrics(activeSong);
        } else {
            lyricsPopup.classList.add('hidden');
        }
    }
});

// --- Таймлайн ---
// --- Оновлення таймлайну ---
function updateTimeline() {
    if (!currentAudio.src) return;

    const cur = currentAudio.currentTime;
    const dur = currentAudio.duration;

    if (isNaN(dur)) return; // якщо тривалість ще не визначена

    currentTimeEl.textContent = formatTime(cur);  // пройдений час
    durationEl.textContent = formatTime(dur);    // загальна тривалість
    timeline.value = (cur / dur) * 100;
}

// --- Формат часу ---
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// --- Таймлайн при зміні ---
timeline.addEventListener('input', () => {
    if (currentAudio.duration) {
        currentAudio.currentTime = (timeline.value / 100) * currentAudio.duration;
    }
});

// --- Події аудіо ---
// Ці слухачі додаються один раз, після чого не додаємо їх повторно
currentAudio.addEventListener('timeupdate', updateTimeline);
currentAudio.addEventListener('loadedmetadata', updateTimeline);


// --- Попап тексту ---
function showLyrics(song){
    lyricsContent.textContent = song.lyrics;
    lyricsPopup.classList.remove('hidden');
}


// --- Черга ---
queueButton.addEventListener('click', () => {
    queuePopup.classList.toggle('hidden');
    renderQueue();
});

function addToQueue(song){
    if(!queue.find(s => s.id === song.id)){
        queue.push(song);
        localStorage.setItem('musicQueue', JSON.stringify(queue));
        renderQueue();
    }
}

function renderQueue(){
    queueList.innerHTML = '';
    queue.forEach(song => {
        const card = createSongCard(song);
        queueList.appendChild(card);
    });
}

clearQueueBtn.addEventListener('click', () => {
    queue = [];
    localStorage.removeItem('musicQueue');
    renderQueue();
});

playQueueBtn.addEventListener('click', () => {
    if(queue.length){
        isPlayingQueue = true;
        playNextInQueue();
        queuePopup.classList.add('hidden');
        if(lyricsPopup.classList.contains('hidden')){
            showLyrics(activeSong);
        } else {
            lyricsPopup.classList.add('hidden');
        }
    }
});


// --- Глобальний слухач на кінець треку ---
currentAudio.addEventListener('ended', () => {
    if(isPlayingQueue){
        playNextInQueue();
    }
});

// --- Кнопка відтворення черги ---
playQueueBtn.addEventListener('click', () => {
    if(queue.length){
        isPlayingQueue = true;
        // Якщо зараз нічого не грає, відтворюємо першу пісню
        if(currentAudio.paused || !activeSong) {
            playNextInQueue();
        }
    }
});

// --- Функція відтворення наступної пісні ---
function playNextInQueue(){
    if(queue.length){
        const next = queue.shift();      // беремо першу пісню
        localStorage.setItem('musicQueue', JSON.stringify(queue));
        renderQueue();                   // оновлюємо список черги
        playSong(next);                  // відтворюємо
        

        // --- Оновлюємо текст пісні, якщо попап відкритий ---
        if(!lyricsPopup.classList.contains('hidden')) {
            showLyrics(next);
        }
    } else {
        isPlayingQueue = false;
    }
}


// --- Відтворення пісні ---
function playSong(song){
    if(activeSong && activeSong.id !== song.id) currentAudio.pause();

    activeSong = song;
    currentAudio.src = song.audio;
    currentAudio.play();
    playerTitle.textContent = song.title;
    playerPlay.textContent = '⏸';

    updateTimeline(); // одразу оновлюємо таймлайн
}



// --- Ініціалізація ---
renderSongs();
renderQueue();