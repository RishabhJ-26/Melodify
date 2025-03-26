console.log('lets write JS');
let currsong = new Audio();
let songs;
let currFolder;

const baseUrl = `https://rishabhj-26.github.io/Melodify`;

// Format the time for the player
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Fetch and display songs from the specified folder
async function getSongs(folder) {
  currFolder = folder;
  let response = await fetch(`${baseUrl}/${folder}/`);
  if (!response.ok) {
    console.error(`Failed to fetch songs from ${baseUrl}/${folder}/`);
    return [];
  }
  
  let htmlContent = await response.text();
  let div = document.createElement("div");
  div.innerHTML = htmlContent;
  let anchors = div.getElementsByTagName("a");

  songs = [];
  for (let element of anchors) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${baseUrl}/${folder}/`)[1]);
    }
  }

  // Display song list
  let songul = document.querySelector(".songList ul");
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML += `
      <li>
        <img class="invert" src="images/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Rishabh</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="images/play.svg" alt="">
        </div>
      </li>`;
  }

  // Add click listeners for each song
  Array.from(songul.getElementsByTagName("li")).forEach((element) => {
    element.addEventListener("click", () => {
      playMusic(element.querySelector(".info div").innerText.trim());
    });
  });

  return songs;
}

// Play the selected song
const playMusic = (track, pause = false) => {
  currsong.src = `${baseUrl}/${currFolder}/${track}`;
  if (!pause) {
    currsong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerText = decodeURI(track);
  document.querySelector(".songtime").innerText = "00:00/00:00";
};

// Display all available albums
async function displayAlbums() {
  let response = await fetch(`${baseUrl}/songs/`);
  if (!response.ok) {
    console.error(`Failed to fetch albums from ${baseUrl}/songs/`);
    return;
  }

  let htmlContent = await response.text();
  let div = document.createElement("div");
  div.innerHTML = htmlContent;
  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".cardContainer");
  for (let element of anchors) {
    if (element.href.includes("/songs/") && !element.href.endsWith("/songs/")) {
      let folder = element.href.split("/").slice(-2)[0];
      let metadataResponse = await fetch(`${baseUrl}/songs/${folder}/info.json`);
      
      if (!metadataResponse.ok) {
        console.error(`Failed to fetch metadata from ${baseUrl}/songs/${folder}/info.json`);
        continue;
      }

      let metadata = await metadataResponse.json();
      cardContainer.innerHTML += `
        <div data-folder="songs/${folder}" class="card">
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" />
            </svg>
          </div>
          <img src="${baseUrl}/songs/${folder}/cover.jpg" alt="">
          <h2>${metadata.title}</h2>
          <p>${metadata.description}</p>
        </div>`;
    }
  }

  // Add event listeners for each album card
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    card.addEventListener("click", async () => {
      songs = await getSongs(card.dataset.folder);
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
}

// Main function to initialize the player
async function main() {
  await displayAlbums();

  if (songs && songs.length > 0) {
    playMusic(songs[0], true);
  }

  // Play/Pause functionality
  play.addEventListener("click", () => {
    if (currsong.paused) {
      currsong.play();
      play.src = "images/pause.svg";
    } else {
      currsong.pause();
      play.src = "images/play.svg";
    }
  });

  currsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerText = `${formatTime(currsong.currentTime)}/${formatTime(currsong.duration)}`;
    document.querySelector(".circle").style.left = `${(currsong.currentTime / currsong.duration) * 100}%`;
  });

  // Seekbar functionality
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.clientWidth) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
    currsong.currentTime = (percent / 100) * currsong.duration;
  });

  // Volume control
  document.querySelector(".range input").addEventListener("input", (e) => {
    currsong.volume = e.target.value / 100;
  });

  // Mute/Unmute
  document.querySelector(".vol img").addEventListener("click", (e) => {
    if (currsong.volume === 0) {
      currsong.volume = 0.5;
      e.target.src = "images/volume.svg";
    } else {
      currsong.volume = 0;
      e.target.src = "images/mute.svg";
    }
  });
}

main();
