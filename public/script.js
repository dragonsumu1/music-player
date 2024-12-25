document.addEventListener('DOMContentLoaded', () => {
  const songList = document.getElementById('song-list');
  const myPlaylist = document.getElementById('my-playlist');
  const audioPlayer = document.getElementById('audio-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const songTitleText = document.getElementById('song-title-text');
  const volumeSlider = document.getElementById('volume-slider');
  let currentSongIndex = 0;
  let isShuffling = false;
  let songs = [];
  let playlistSongs = [];

  // Fetch the list of songs from the server
  fetch('/api/music')
    .then(response => response.json())
    .then(data => {
      songs = data;
      renderSongList();
    });

  // Render the list of songs
  function renderSongList() {
    songList.innerHTML = '';
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song;

      const addButton = document.createElement('button');
      addButton.textContent = 'Add';
      addButton.classList.add('add-btn');
      addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        addToPlaylist(song);
      });

      li.appendChild(addButton);
      li.addEventListener('click', () => playSong(index));
      songList.appendChild(li);
    });
  }

  // Play the selected song
  function playSong(index) {
    currentSongIndex = index;
    const song = songs[index];
    audioPlayer.src = `/api/music/${song}`;
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
    const songItems = songList.querySelectorAll('li');
    songItems.forEach((item, index) => {
      item.classList.toggle('active', index === currentSongIndex);
    });
  }

  // Add song to playlist
  function addToPlaylist(song) {
    playlistSongs.push(song);
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
    li.addEventListener('click', () => playPlaylistSong(song));
    myPlaylist.appendChild(li);
  }

  // Remove song from playlist
  function removeFromPlaylist(li, song) {
    const index = playlistSongs.indexOf(song);
    if (index > -1) {
      playlistSongs.splice(index, 1);
    }
    myPlaylist.removeChild(li);
  }

  // Play the selected song from the playlist
  function playPlaylistSong(song) {
    const index = songs.indexOf(song);
    if (index > -1) {
      playSong(index);
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
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
  });

  // Play the next song
  nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  });

  // Toggle shuffle mode
  shuffleBtn.addEventListener('click', () => {
    isShuffling = !isShuffling;
    shuffleBtn.classList.toggle('active', isShuffling);
  });

  // Adjust volume
  volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
  });

  // Handle song end event
  audioPlayer.addEventListener('ended', () => {
    if (isShuffling) {
      currentSongIndex = Math.floor(Math.random() * songs.length);
    } else {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
    }
    playSong(currentSongIndex);
  });

  // Update play/pause button state when audio is played or paused
  audioPlayer.addEventListener('play', updatePlayPauseButton);
  audioPlayer.addEventListener('pause', updatePlayPauseButton);
});
