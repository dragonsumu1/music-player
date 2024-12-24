const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const volumeSlider = document.getElementById('volume-slider');
const playlistContainer = document.querySelector('.playlist');
const songListContainer = document.getElementById('playlist');
const searchInput = document.getElementById('search-input');
const songTitle = document.querySelector('.song-title span');
const songTitleContainer = document.querySelector('.song-title');

let songs = [];
let currentSongIndex = 0;
let isShuffle = false;
let myPlaylist = [];
let isPlayingFromPlaylist = false;

// Fetch the list of songs from the server
fetch('/music')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }
    songs = data.sort((a, b) => a.localeCompare(b)); // Sort songs in ascending order
    if (songs.length > 0) {
      loadSong(songs[currentSongIndex]);
      filterSongs(); // Filter songs when they load up
    } else {
      console.error('No songs found');
    }
  })
  .catch(error => console.error('Error fetching songs:', error));

// Function to load a song
function loadSong(song) {
  audioPlayer.src = `/music/${song}`;
  audioPlayer.load();
  songTitle.textContent = song; // Display the song name
  songTitleContainer.classList.remove('paused'); // Ensure the marquee effect is active
}

// Function to play or pause
function togglePlayPause() {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.classList.remove('play');
    playPauseBtn.classList.add('pause');
    songTitleContainer.classList.remove('paused'); // Resume the marquee effect
  } else {
    audioPlayer.pause();
    playPauseBtn.classList.remove('pause');
    playPauseBtn.classList.add('play');
    songTitleContainer.classList.add('paused'); // Pause the marquee effect
  }
}

// Function to skip to the next song
function nextSong() {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * (isPlayingFromPlaylist ? myPlaylist.length : songs.length));
  } else {
    currentSongIndex = (currentSongIndex + 1) % (isPlayingFromPlaylist ? myPlaylist.length : songs.length);
  }
  loadSong(isPlayingFromPlaylist ? myPlaylist[currentSongIndex] : songs[currentSongIndex]);
  audioPlayer.play();
  playPauseBtn.classList.remove('play');
  playPauseBtn.classList.add('pause');
}

// Function to go to the previous song
function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + (isPlayingFromPlaylist ? myPlaylist.length : songs.length)) % (isPlayingFromPlaylist ? myPlaylist.length : songs.length);
  loadSong(isPlayingFromPlaylist ? myPlaylist[currentSongIndex] : songs[currentSongIndex]);
  audioPlayer.play();
  playPauseBtn.classList.remove('play');
  playPauseBtn.classList.add('pause');
}

// Function to toggle shuffle
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
  if (isShuffle) {
    if (isPlayingFromPlaylist) {
      myPlaylist = shuffleArray(myPlaylist);
      populateMyPlaylist();
    } else {
      songs = shuffleArray(songs);
      filterSongs();
    }
  } else {
    songs.sort((a, b) => a.localeCompare(b));
    filterSongs();
    myPlaylist.sort((a, b) => a.localeCompare(b));
    populateMyPlaylist();
  }
}

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to add a song to the playlist
function addToPlaylist(song) {
  if (!myPlaylist.includes(song)) {
    myPlaylist.push(song);
    populateMyPlaylist();
  }
}

// Function to remove a song from the playlist
function removeFromPlaylist(song) {
  myPlaylist = myPlaylist.filter(item => item !== song);
  populateMyPlaylist();
}

// Populate the song list on the homepage
function populateSongList(filteredSongs) {
  songListContainer.innerHTML = ''; // Clear any existing items

  filteredSongs.forEach((song, index) => {
    const songItem = document.createElement('li');
    songItem.textContent = song;
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.className = 'add-btn';
    addButton.onclick = (e) => {
      e.stopPropagation();
      addToPlaylist(song);
    };
    songItem.appendChild(addButton);
    songItem.onclick = () => {
      currentSongIndex = index;
      isPlayingFromPlaylist = false;
      loadSong(song);
      audioPlayer.play();
      playPauseBtn.classList.remove('play');
      playPauseBtn.classList.add('pause');
    };
    songListContainer.appendChild(songItem);
  });
}

// Populate the playlist
function populateMyPlaylist() {
  const myPlaylistContainer = document.getElementById('my-playlist');
  myPlaylistContainer.innerHTML = ''; // Clear any existing items

  myPlaylist.forEach((song, index) => {
    const songItem = document.createElement('li');
    songItem.textContent = song;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-btn';
    removeButton.onclick = (e) => {
      e.stopPropagation();
      removeFromPlaylist(song);
    };
    songItem.appendChild(removeButton);
    songItem.onclick = () => {
      currentSongIndex = index;
      isPlayingFromPlaylist = true;
      loadSong(song);
      audioPlayer.play();
      playPauseBtn.classList.remove('play');
      playPauseBtn.classList.add('pause');
    };
    myPlaylistContainer.appendChild(songItem);
  });
}

// Function to filter the song list based on the search query
function filterSongs() {
  const query = searchInput.value.toLowerCase();
  const filteredSongs = songs.filter(song => song.toLowerCase().includes(query));
  populateSongList(filteredSongs);
}

// Function to change the volume
function changeVolume() {
  audioPlayer.volume = volumeSlider.value;
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
shuffleBtn.addEventListener('click', toggleShuffle);
searchInput.addEventListener('input', filterSongs);
volumeSlider.addEventListener('input', changeVolume);

// Play the next song when the current song ends
audioPlayer.addEventListener('ended', nextSong);
