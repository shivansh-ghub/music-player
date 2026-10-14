// ---------- 1. Your songs ----------
// These are free demo tracks (SoundHelix) so the player works right away.
// To use your own songs: put MP3 files in a "songs" folder next to index.html
// and change src to "songs/yourfile.mp3". Only use music you have the right to use.
const songs = [
  { title: "Song 1", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Song 2", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Song 3", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Song 4", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
];

// ---------- 2. Grab the elements from index.html ----------
const audio = document.getElementById("audio");
const vinyl = document.getElementById("vinyl");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const seek = document.getElementById("seek");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const volumeEl = document.getElementById("volume");
const listEl = document.getElementById("playlist");
const messageEl = document.getElementById("message");

// ---------- 3. Things the player remembers ----------
let current = 0;        // which song we are on
let shuffleOn = false;
let repeatOn = false;

// ---------- 4. Helper: turn seconds into 3:07 ----------
function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return m + ":" + s;
}

// ---------- 5. Load a song (does not start playing) ----------
function loadSong(index) {
  current = index;
  const song = songs[index];
  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  messageEl.textContent = "";
  seek.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  highlightCurrent();
}

// ---------- 6. Play and pause ----------
function playSong() {
  audio.play().catch(function () {
    messageEl.textContent = "Could not play this song. Check your internet or the file path.";
  });
}

function togglePlay() {
  if (audio.paused) playSong();
  else audio.pause();
}

// Keep the button and the spinning record in sync with the audio
audio.addEventListener("play", function () {
  playBtn.innerHTML = "&#9208;";          // pause icon
  playBtn.setAttribute("aria-label", "Pause");
  vinyl.classList.add("playing");
});
audio.addEventListener("pause", function () {
  playBtn.innerHTML = "&#9654;";          // play icon
  playBtn.setAttribute("aria-label", "Play");
  vinyl.classList.remove("playing");
});

// ---------- 7. Next and previous ----------
function nextSong() {
  let index;
  if (shuffleOn && songs.length > 1) {
    do { index = Math.floor(Math.random() * songs.length); } while (index === current);
  } else {
    index = (current + 1) % songs.length;
  }
  loadSong(index);
  playSong();
}

function prevSong() {
  // If we are more than 3 seconds in, restart this song instead
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  loadSong((current - 1 + songs.length) % songs.length);
  playSong();
}

// When a song ends: repeat it, or go to the next one
audio.addEventListener("ended", function () {
  if (repeatOn) {
    audio.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

// ---------- 8. Seek bar and time ----------
audio.addEventListener("loadedmetadata", function () {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", function () {
  if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

seek.addEventListener("input", function () {
  if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
});

// ---------- 9. Volume ----------
audio.volume = volumeEl.value / 100;
volumeEl.addEventListener("input", function () {
  audio.volume = volumeEl.value / 100;
});

// ---------- 10. Shuffle and repeat buttons ----------
shuffleBtn.addEventListener("click", function () {
  shuffleOn = !shuffleOn;
  shuffleBtn.classList.toggle("active", shuffleOn);
});
repeatBtn.addEventListener("click", function () {
  repeatOn = !repeatOn;
  repeatBtn.classList.toggle("active", repeatOn);
});

// ---------- 11. Build the song list on the page ----------
function buildPlaylist() {
  songs.forEach(function (song, index) {
    const li = document.createElement("li");
    li.innerHTML = "<span>" + song.title + "</span><span class='artist-name'>" + song.artist + "</span>";
    li.addEventListener("click", function () {
      loadSong(index);
      playSong();
    });
    listEl.appendChild(li);
  });
}

function highlightCurrent() {
  Array.from(listEl.children).forEach(function (li, index) {
    li.classList.toggle("current", index === current);
  });
}

// ---------- 12. Show a message if a file fails to load ----------
audio.addEventListener("error", function () {
  messageEl.textContent = "This song could not be loaded.";
});

// ---------- 13. Connect the buttons and start ----------
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Spacebar plays/pauses (unless you are using a slider or button)
document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    togglePlay();
  }
});

buildPlaylist();
loadSong(0);
