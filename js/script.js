console.log('lets write JS');
let currsong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0)
    return '00:00';
  // Ensure seconds is an integer
  seconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Pad with leading zeros if necessary
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3"))
      songs.push(element.href.split(`/${folder}/`)[1]);
  }
  //shows all the songs ini playlist
  let songul = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML = songul.innerHTML + `<li>
                        <img class="invert" src="images/music.svg" alt="">
                        <div class="info">
                            <div> ${song.replaceAll("%20", " ")}</div>
                            <div>Rishabh</div>
                        </div>
                       <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert"  src="images/play.svg" alt="">
                       </div> 
      </li>`;
  }
  //attach an event listener to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {

      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })

  })
  return songs;
}
const playMusic = (track, pause = false) => {

  currsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currsong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";

}


async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];


    if (e.href.includes("/songs")) {

      let folder = e.href.split("/").slice(-2)[0]
      //Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">

                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                     </div>`
    }
  }

  //Load the playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0]);

    })
  })

}



async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  //Display all albums on the page
  displayAlbums();

  //Add a event Listener to play button
  play.addEventListener("click", e => {
    if (currsong.paused) {
      currsong.play();
      play.src = "images/pause.svg";
    }
    else {
      currsong.pause();
      play.src = "images/play.svg";

    }
  })
  currsong.addEventListener("timeupdate", () => {


    document.querySelector(".songtime").innerHTML = `${formatTime(currsong.currentTime)}/${formatTime(currsong.duration)}`;
    document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
  })
  //Add a event Listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currsong.currentTime = ((percent * currsong.duration) / 100);

  })
  //Add a event Listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", e => {
    document.querySelector(".left").style.left = "0";
  })
  //Add a event Listener to close
  document.querySelector(".close").addEventListener("click", e => {
    document.querySelector(".left").style.left = "-100%";
  })
  //Add a  event Listener to previous 
  previous.addEventListener("click", e => {
    console.log('Previous ');
    let index = songs.indexOf(currsong.src.split('/').slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }

  })
  //Add a event Listener to next
  next.addEventListener("click", e => {
    console.log('next');

    let index = songs.indexOf(currsong.src.split('/').slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }


  })
  //Add a event Listener to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {

    console.log("setting volume to " + e.target.value + " /100");
    currsong.volume = parseInt(e.target.value) / 100;
     if(currsong.volume>0)
     {
      document.querySelector(".vol>img").src=document.querySelector(".vol>img").src.replace("mute.svg","volume.svg");
     }

  })

  //Add a event Listener to mute volume
  document.querySelector(".vol>img").addEventListener("click", e => {
      
     if(e.target.src.includes("volume.svg"))
     {
      e.target.src=e.target.src.replace("volume.svg","mute.svg");
      currsong.volume=0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else
    {
      document.querySelector(".range").getElementsByTagName("input")[0].value=10;
       e.target.src=e.target.src.replace("mute.svg","volume.svg");
       currsong.volume=.1;

     }
     
  })

}
main()

