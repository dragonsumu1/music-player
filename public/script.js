document.addEventListener('DOMContentLoaded', () => {
  const songList = document.getElementById('song-list');
  const myPlaylist = document.getElementById('my-playlist');
  const searchInput = document.getElementById('search');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  let currentSongIndex = 0;
  let songs = [];
  let playlistSongs = [];
  let shuffledSongs = [];
  let shuffledPlaylist = [];
  let isPlaylistActive = false;

  // Fetch the list of songs from the server
  fetch('/api/music')
    .then(response => response.json())
    .then(data => {
      songs = data.map(song => ({
        name: song,
        url: `https://raw.githubusercontent.com/dragonsumu1/music-player/main/music/${song}`
      }));
      shuffledSongs = [...songs]; // Initialize shuffledSongs with the original list
      Amplitude.init({
        songs: shuffledSongs
      });
      renderSongList();
    });

  // Render the list of songs
  function renderSongList(filteredSongs = songs) {
    songList.innerHTML = '';
    filteredSongs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.name;

      const addButton = document.createElement('button');
      addButton.textContent = '+'; // Change text to "+"
      addButton.classList.add('add-btn');
      addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        addToPlaylist(song);
      });

      li.appendChild(addButton);
      li.addEventListener('click', () => {
        isPlaylistActive = false;
        shuffledSongs = [...songs]; // Reset shuffledSongs to the original list
        Amplitude.playSongAtIndex(index);
      });
      songList.appendChild(li);
    });
  }

  // Render the playlist
  function renderPlaylist() {
    myPlaylist.innerHTML = '';
    playlistSongs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.name;

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('remove-btn');
      removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromPlaylist(li, song);
      });

      li.appendChild(removeButton);
      li.addEventListener('click', () => {
        isPlaylistActive = true;
        shuffledPlaylist = [...playlistSongs]; // Reset shuffledPlaylist to the playlist
        Amplitude.playSongAtIndex(index);
      });
      myPlaylist.appendChild(li);
    });
  }

  // Add song to playlist
  function addToPlaylist(song) {
    playlistSongs.push(song);
    renderPlaylist();
  }

  // Remove song from playlist
  function removeFromPlaylist(li, song) {
    const index = playlistSongs.indexOf(song);
    if (index > -1) {
      playlistSongs.splice(index, 1);
    }
    renderPlaylist();
  }

  // Filter songs based on search input
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => song.name.toLowerCase().includes(searchTerm));
    renderSongList(filteredSongs);
  });

  // Play the previous song
  prevBtn.addEventListener('click', () => {
    Amplitude.prev();
  });

  // Play the next song
  nextBtn.addEventListener('click', () => {
    Amplitude.next();
  });

  // Play/pause the current song
  playPauseBtn.addEventListener('click', () => {
    if (Amplitude.getPlayerState() === 'playing') {
      Amplitude.pause();
      playPauseBtn.classList.remove('playing');
    } else {
      Amplitude.play();
      playPauseBtn.classList.add('playing');
    }
  });

  // Update play/pause button icon based on player state
  Amplitude.bind('play', () => {
    playPauseBtn.classList.add('playing');
  });

  Amplitude.bind('pause', () => {
    playPauseBtn.classList.remove('playing');
  });
});
