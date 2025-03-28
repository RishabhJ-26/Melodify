console.log('lets write JS');
let currsong = new Audio();
let songs = [];
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`./${folder}/info.json`).then(res => res.json());
    songs = response.songs || [];
    
    let songul = document.querySelector(".songList ul");
    songul.innerHTML = "";

    songs.forEach((song, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="./images/music.svg" alt="">
            <div class="info">
                <div>${decodeURIComponent(song)}</div> 
                <div>Rishabh</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert play-icon" src="./images/play.svg" alt="">
            </div>
        `;

        li.addEventListener("click", () => {
            playMusic(song);
            updatePlayIcons(index);
        });

        songul.appendChild(li);
    });
}

function updatePlayIcons(activeIndex) {
    document.querySelectorAll(".play-icon").forEach((icon, index) => {
        icon.src = index === activeIndex ? "./images/pause.svg" : "./images/play.svg";
    });
}

function playMusic(track, pause = false) {
    currsong.src = `./${currFolder}/${encodeURIComponent(track)}`;

    if (!pause) {
        currsong.play();
        document.querySelector("#play").src = "./images/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let folders = ["beast", "bright", "goodfriday", "happy", "jain", "love", "ncs", "old", "power", "rap", "sc", "uplifting"];
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of folders) {
        try {
            let info = await fetch(`./songs/${folder}/info.json`).then(res => res.json());

            let div = document.createElement("div");
            div.classList.add("card");
            div.dataset.folder = folder;
            div.innerHTML = `
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="./songs/${folder}/cover.jpg" alt="">
                <h2>${info.title}</h2>
                
            `;

            div.addEventListener("click", async () => {
                await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
                updatePlayIcons(0);
            });

            cardContainer.appendChild(div);
        } catch (error) {
            console.error(`Failed to fetch info.json for ${folder}:`, error);
        }
    }
}

async function main() {
    document.querySelector("#play").src = "./images/play.svg";

    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    displayAlbums();

    document.querySelector("#play").addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play();
            document.querySelector("#play").src = "./images/pause.svg";
        } else {
            currsong.pause();
            document.querySelector("#play").src = "./images/play.svg";
        }
    });

    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currsong.currentTime)} / ${formatTime(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = (percent * currsong.duration) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currsong.src.split('/').pop()));
        if (index > 0) {
            playMusic(songs[index - 1]);
            updatePlayIcons(index - 1);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currsong.src.split('/').pop()));
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
            updatePlayIcons(index + 1);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currsong.volume = e.target.value / 100;
        document.querySelector(".vol>img").src = currsong.volume > 0 ? "./images/volume.svg" : "./images/mute.svg";
    });

    document.querySelector(".vol>img").addEventListener("click", (e) => {
        if (currsong.volume > 0) {
            e.target.src = "./images/mute.svg";
            currsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "./images/volume.svg";
            currsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
