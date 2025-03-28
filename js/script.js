console.log('lets write JS');

let currsong = new Audio();
let songs = [];
let currFolder = "";
let play = document.querySelector("#play");
let currentPlayingLi = null; // Track currently playing song in list

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`./${folder}/info.json`);
    let data = await response.json();
    songs = data.songs || []; 

    let songul = document.querySelector(".songList ul");
    songul.innerHTML = ""; // Clear previous songs

    songs.forEach((song, index) => {
        let li = document.createElement("li");
        li.dataset.index = index; // Store song index
        li.innerHTML = `
            <img class="invert" src="./images/music.svg" alt="">
            <div class="info">
                <div>${decodeURIComponent(song)}</div> 
                <div>Rishabh</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert play-btn" src="./images/play.svg" alt="">
            </div>
        `;

        // Add event listener to play music when clicked
        li.addEventListener("click", () => {
            playMusic(song, index, li);
        });

        songul.appendChild(li);
    });

    // Auto-play first song when folder is opened
    if (songs.length > 0) {
        playMusic(songs[0], 0, songul.children[0]);
    }
}

const playMusic = (track, index, liElement = null, pause = false) => {
    currsong.src = `./${currFolder}/${encodeURIComponent(track)}`;

    if (!pause) {
        currsong.play();
        play.src = "./images/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    
    currsong.dataset.index = index; // Store current song index

    // Update Play/Pause Button in Song List
    if (currentPlayingLi) {
        currentPlayingLi.querySelector(".play-btn").src = "./images/play.svg";
    }
    if (liElement) {
        liElement.querySelector(".play-btn").src = "./images/pause.svg";
        currentPlayingLi = liElement;
    }
};

async function displayAlbums() {
    let folders = ["beast", "bright", "goodfriday", "happy", "jain", "love", "ncs", "old", "power", "rap", "sc", "uplifting"];
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; 

    folders.forEach(folder => {
        let div = document.createElement("div");
        div.classList.add("card");
        div.dataset.folder = folder;
        div.innerHTML = `
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="./songs/${folder}/cover.jpg" alt="">
            <h2>${folder}</h2>
        `;

        div.addEventListener("click", async () => {
            await getSongs(`songs/${folder}`);
        });

        cardContainer.appendChild(div);
    });
}

async function main() {
    await getSongs("songs/ncs");
    displayAlbums();

    play.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play();
            play.src = "./images/pause.svg";
        } else {
            currsong.pause();
            play.src = "./images/play.svg";
        }
    });

    currsong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = `00:00 / ${formatTime(currsong.duration)}`;
    });

    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currsong.currentTime)} / ${formatTime(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = (percent * currsong.duration) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // 🔥 **Fix Previous & Next Button**
    document.querySelector("#previous").addEventListener("click", () => {
        let index = parseInt(currsong.dataset.index);
        if (index > 0) {
            playMusic(songs[index - 1], index - 1, document.querySelector(".songList ul").children[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = parseInt(currsong.dataset.index);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1], index + 1, document.querySelector(".songList ul").children[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currsong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".vol>img").src = currsong.volume > 0 ? "./images/volume.svg" : "./images/mute.svg";
    });

    document.querySelector(".vol>img").addEventListener("click", (e) => {
        let volumeControl = document.querySelector(".range input");
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "./images/mute.svg";
            currsong.volume = 0;
            volumeControl.value = 0;
        } else {
            volumeControl.value = 10;
            e.target.src = "./images/volume.svg";
            currsong.volume = 0.1;
        }
    });
}

main();
