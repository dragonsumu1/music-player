document.addEventListener('DOMContentLoaded', () => {
  const songList = document.getElementById('song-list');
  const myPlaylist = document.getElementById('my-playlist');
  const searchInput = document.getElementById('search');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const profileInput = document.getElementById('profile');
  const createProfileBtn = document.getElementById('create-profile-btn');
  const showProfileBtn = document.getElementById('show-profile-btn');
  const listProfilesBtn = document.getElementById('list-profiles-btn');
  const profilesList = document.getElementById('profiles-list');
  const profilesUl = document.getElementById('profiles');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const volumeControl = document.getElementById('volume-control');
  let currentSongIndex = 0;
  let songs = [];
  let playlistSongs = [];
  let isPlaylistActive = false;
  let currentProfile = '';

  // Fetch the list of songs from the server
  fetch('/api/music')
    .then(response => response.json())
    .then(data => {
      songs = data.map(song => ({
        name: song,
        url: `https://raw.githubusercontent.com/dragonsumu1/music-player/main/music/${song}`
      }));
      Amplitude.init({
        songs: songs
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
        currentSongIndex = index;
        // Stop the currently playing song
        Amplitude.stop();
        Amplitude.init({
          songs: songs
        });
        Amplitude.playSongAtIndex(index);
        highlightActiveSong(index);
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
        currentSongIndex = index;
        // Stop the currently playing song
        Amplitude.stop();
        Amplitude.init({
          songs: playlistSongs
        });
        Amplitude.playSongAtIndex(index);
        highlightActiveSong(index, true);
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
    if (isPlaylistActive) {
      currentSongIndex = (currentSongIndex - 1 + playlistSongs.length) % playlistSongs.length;
      Amplitude.playSongAtIndex(currentSongIndex);
      highlightActiveSong(currentSongIndex, true);
    } else {
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      Amplitude.playSongAtIndex(currentSongIndex);
      highlightActiveSong(currentSongIndex);
    }
  });

  // Play the next song
  nextBtn.addEventListener('click', () => {
    const activeSongs = isPlaylistActive ? playlistSongs : songs;
  
    // Stop the currently playing song
    Amplitude.stop();
  
    // Update currentSongIndex
    currentSongIndex = (currentSongIndex + 1) % activeSongs.length;
  
    // Reinitialize Amplitude with the correct song list
    Amplitude.init({
      songs: activeSongs
    });
  
    // Play the song at the updated index
    Amplitude.playSongAtIndex(currentSongIndex);
  
    // Highlight the active song
    highlightActiveSong(currentSongIndex, isPlaylistActive);
  });
  

  // Highlight the active song
  function highlightActiveSong(index, isPlaylist = false) {
    const listItems = isPlaylist ? myPlaylist.querySelectorAll('li') : songList.querySelectorAll('li');
    listItems.forEach((li, i) => {
      if (i === index) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });
  }

  // Load profile
  function loadProfile(username) {
    fetch(`/api/profile/${username}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        return response.json();
      })
      .then(profile => {
        playlistSongs = profile.playlist.map(song => ({
          name: song.name,
          url: song.url
        }));
        renderPlaylist();
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        alert('Profile not found');
      });
  }
  

  // Show profile
  function showProfile() {
    const username = profileInput.value;
    if (!username) {
      alert('Please enter a profile name');
      return;
    }
    loadProfile(username);
  }

// Save profile
function saveProfile() {
  const username = profileInput.value;
  if (!username) {
    alert('Please enter a profile name');
    return;
  }

  // Ensure proper serialization of playlistSongs
  const serializedPlaylist = playlistSongs.map(song => ({
    name: song.name,
    url: song.url
  }));

  fetch(`/api/profile/${username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ playlist: serializedPlaylist })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      return response.json();
    })
    .then(data => {
      alert('Profile saved');
      // Reload the profile after saving to update the playlist
      loadProfile(username);
    })
    .catch(err => {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile');
    });
}

  // Create profile
  function createProfile() {
    const username = profileInput.value;
    if (!username) {
      alert('Please enter a profile name');
      return;
    }

    // Ensure proper serialization of playlistSongs
    const serializedPlaylist = playlistSongs.map(song => ({
      name: song.name,
      url: song.url
    }));

    fetch(`/api/profile/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playlist: serializedPlaylist })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create profile');
        }
        return response.json();
      })
      .then(data => {
        alert('Profile created');
        // Reload the profile after creating to update the playlist
        loadProfile(username);
      })
      .catch(err => {
        console.error('Failed to create profile:', err);
        alert('Failed to create profile');
      });
  }

  // List profiles
  function listProfiles() {
    fetch('/api/profiles')
      .then(response => response.json())
      .then(profiles => {
        profilesUl.innerHTML = '';
        Object.keys(profiles).forEach(profile => {
          const li = document.createElement('li');
          li.textContent = profile;
          profilesUl.appendChild(li);
        });
        profilesList.style.display = 'block';
      })
      .catch(err => {
        console.error('Failed to list profiles:', err);
      });
  }

  // Event listeners for profile management
  profileInput.addEventListener('change', (e) => {
    currentProfile = e.target.value;
    loadProfile(currentProfile);
  });

  createProfileBtn.addEventListener('click', createProfile);
  showProfileBtn.addEventListener('click', showProfile);
  saveProfileBtn.addEventListener('click', saveProfile);
  listProfilesBtn.addEventListener('click', listProfiles);

  // Handle volume control
  volumeControl.addEventListener('input', function() {
    Amplitude.setVolume(this.value);
  });
});
