console.log('lets write JS');
let currsong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
  currFolder = folder;
  try {
    const response = await fetch(`/songs/${folder}/`);
    if (!response.ok) {
      console.error(`Failed to fetch songs from folder: ${folder}`);
      return [];
    }

    const text = await response.text();
    const div = document.createElement('div');
    div.innerHTML = text;
    const as = div.getElementsByTagName('a');
    songs = [];

    for (let element of as) {
      if (element.href.endsWith('.mp3')) {
        const songName = element.href.split(`/${folder}/`).pop();
        songs.push(decodeURIComponent(songName));  // Ensure proper formatting
      }
    }

    const songul = document.querySelector('.songList ul');
    songul.innerHTML = '';

    for (const song of songs) {
      songul.innerHTML += `
        <li>
          <img class="invert" src="images/music.svg" alt="">
          <div class="info">
            <div>${song.replaceAll('%20', ' ')}</div>
            <div>Rishabh</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="images/play.svg" alt="">
          </div>
        </li>`;
    }

    // Attach event listeners to each song
    Array.from(songul.getElementsByTagName('li')).forEach(e => {
      e.addEventListener('click', () => {
        const songName = e.querySelector('.info div').innerText.trim();
        playMusic(songName);
      });
    });

    return songs;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}

function playMusic(track, pause = false) {
  currsong.src = `/songs/${currFolder}/${track}`;
  if (!pause) {
    currsong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector('.songinfo').innerText = decodeURIComponent(track);
  document.querySelector('.songtime').innerText = "00:00/00:00";
}

async function displayAlbums() {
  try {
    const response = await fetch('/songs/');
    if (!response.ok) {
      console.error('Failed to fetch albums');
      return;
    }

    const text = await response.text();
    const div = document.createElement('div');
    div.innerHTML = text;
    const anchors = div.getElementsByTagName('a');
    const cardContainer = document.querySelector('.cardContainer');

    for (const e of anchors) {
      if (e.href.includes('/songs') && !e.href.includes('.htaccess')) {
        const folder = e.href.split('/').slice(-2)[0];
        const metaResponse = await fetch(`/songs/${folder}/info.json`);
        if (!metaResponse.ok) continue;

        const metadata = await metaResponse.json();
        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${metadata.title}</h2>
            <p>${metadata.description}</p>
          </div>`;
      }
    }

    // Event listener for album cards
    Array.from(document.getElementsByClassName('card')).forEach(e => {
      e.addEventListener('click', async () => {
        const folder = e.getAttribute('data-folder');
        songs = await getSongs(folder);
        if (songs.length > 0) playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error('Error displaying albums:', error);
  }
}

async function main() {
  await getSongs('ncs');
  playMusic(songs[0], true);
  displayAlbums();
}

main();
