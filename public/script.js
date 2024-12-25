document.addEventListener('DOMContentLoaded', () => {
  const songList = document.getElementById('song-list');
  const myPlaylist = document.getElementById('my-playlist');
  const audioPlayer = document.getElementById('audio-player');
  const audioSource = document.getElementById('audio-source');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const songTitleText = document.getElementById('song-title-text');
  const volumeSlider = document.getElementById('volume-slider');
  const searchInput = document.getElementById('search');
  let currentSongIndex = 0;
  let isShufflingSongs = false;
  let isShufflingPlaylist = false;
  let songs = [];
  let playlistSongs = [];
  let shuffledSongs = [];
  let shuffledPlaylist = [];
  let isPlaylistActive = false;

  // Fetch the list of songs from the server
  fetch('/api/music')
    .then(response => response.json())
    .then(data => {
      songs = data;
      shuffledSongs = [...songs]; // Initialize shuffledSongs with the original list
      renderSongList();
    });

  // Render the list of songs
  function renderSongList(filteredSongs = songs) {
    songList.innerHTML = '';
    filteredSongs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song;

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
        playSong(index);
      });
      songList.appendChild(li);
    });
  }

  // Render the playlist
  function renderPlaylist() {
    myPlaylist.innerHTML = '';
    playlistSongs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song;

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
        playSong(index);
      });
      myPlaylist.appendChild(li);
    });
  }

  // Play the selected song
  function playSong(index) {
    currentSongIndex = index;
    const song = isPlaylistActive ? shuffledPlaylist[index] : shuffledSongs[index];
    audioSource.src = `https://raw.githubusercontent.com/dragonsumu1/music-player/main/music/${song}`;
    audioPlayer.load();
    audioPlayer.play();
    updateSongTitle(song);
    updateActiveSong();
    updatePlayPauseButton();
  }

  // Update the song title display
  function updateSongTitle(song) {
    songTitleText.textContent = song;
  }

  // Update the active song in the list
  function updateActiveSong() {
    const songItems = isPlaylistActive ? myPlaylist.querySelectorAll('li') : songList.querySelectorAll('li');
    songItems.forEach((item, index) => {
      item.classList.toggle('active', index === currentSongIndex);
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

  // Shuffle the list of songs or playlist
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Play or pause the audio
  playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseBtn.classList.remove('play');
      playPauseBtn.classList.add('pause');
    } else {
      audioPlayer.pause();
      playPauseBtn.classList.remove('pause');
      playPauseBtn.classList.add('play');
    }
  });

  // Update the play/pause button state
  function updatePlayPauseButton() {
    if (audioPlayer.paused) {
      playPauseBtn.classList.remove('pause');
      playPauseBtn.classList.add('play');
    } else {
      playPauseBtn.classList.remove('play');
      playPauseBtn.classList.add('pause');
    }
  }

  // Play the previous song
  prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + (isPlaylistActive ? shuffledPlaylist.length : shuffledSongs.length)) % (isPlaylistActive ? shuffledPlaylist.length : shuffledSongs.length);
    playSong(currentSongIndex);
  });

  // Play the next song
  nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % (isPlaylistActive ? shuffledPlaylist.length : shuffledSongs.length);
    playSong(currentSongIndex);
  });

  // Toggle shuffle mode for songs
  shuffleBtn.addEventListener('click', () => {
    if (isPlaylistActive) {
      isShufflingPlaylist = !isShufflingPlaylist;
      shuffleBtn.classList.toggle('active', isShufflingPlaylist);
      if (isShufflingPlaylist) {
        shuffledPlaylist = [...playlistSongs];
        shuffleArray(shuffledPlaylist);
      } else {
        shuffledPlaylist = [...playlistSongs];
      }
      renderPlaylist();
    } else {
      isShufflingSongs = !isShufflingSongs;
      shuffleBtn.classList.toggle('active', isShufflingSongs);
      if (isShufflingSongs) {
        shuffledSongs = [...songs];
        shuffleArray(shuffledSongs);
      } else {
        shuffledSongs = [...songs];
      }
      renderSongList(shuffledSongs);
    }
  });

  // Adjust volume
  volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
  });

  // Handle song end event
  audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % (isPlaylistActive ? shuffledPlaylist.length : shuffledSongs.length);
    playSong(currentSongIndex);
  });

  // Update play/pause button state when audio is played or paused
  audioPlayer.addEventListener('play', updatePlayPauseButton);
  audioPlayer.addEventListener('pause', updatePlayPauseButton);

  // Filter songs based on search input
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => song.toLowerCase().includes(searchTerm));
    renderSongList(filteredSongs);
  });
});
