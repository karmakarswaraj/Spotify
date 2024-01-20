let currSong = new Audio();
let getSongs = async function () {
  try {
    let response = await fetch("http://127.0.0.1:5500/songs");
    let data = await response.text();

    let parser = new DOMParser(); // Create a new instance of the DOMParser class
    let doc = parser.parseFromString(data, "text/html"); // Parse the HTML string

    // Select all <a> elements within the document
    let aElements = doc.querySelectorAll("a");

    const songs = {}; // create an object to store the songs

    // Now you can loop through the selected elements
    aElements.forEach((aElement) => {
      let title = aElement.getAttribute("title"); // or .innerText to get the text content
      let href = aElement.getAttribute("href");
      if (title && href) {
        let fileName = title.replace(".mp3", ""); // remove .mp3 from title
        songs[fileName] = href; // store href in songs object
      }
    });

    return songs;
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
};

function getSongDetails(songTitle) {
  let parts = songTitle.split(" - ");
  let artistName = parts[1] || "Unknown";
  let songName = parts[0] || "Unknown";

  return { songName, artistName };
}
async function playMusic(songTitle, artist, pause = false) {
  let src;
  if (artist === "Unknown") {
    src = "/songs/" + songTitle + ".mp3";
  } else {
    src = "/songs/" + songTitle + "%20-%20" + artist + ".mp3";
  }

  if (currSong.src !== src) {
    currSong.src = src;
    await currSong.load();
  }

  try {
    if (!pause) {
      await currSong.play();
      play.src = "./img/pause1.svg";
    }

    document.querySelector(".song-info").innerHTML = `
    <div class="info">
      <div>Song - ${songTitle}</div>
      <div>Artist - ${artist}</div>
    </div>
  `;
    duration.innerHTML = "00:00";
    totalDuration.innerHTML = "00:00";
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
}

async function pauseMusic() {
  try {
    await currSong.pause();
    play.src = "./img/play.svg";
  } catch (error) {
    console.error("Failed to pause audio:", error);
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

async function main() {
  let songs = await getSongs();

  const firstSong = Object.keys(songs)[1];
  const [songName, artistName] = firstSong.split(' - ');

  await playMusic(songName.trim(),artistName.trim(),true);


  const localSongs = document
    .querySelector(".local-songs")
    .getElementsByTagName("ul")[0];

  let isFirstIteration = true;
  let currentlyPlayingLi = null;

  Object.entries(songs).forEach(([key, value]) => {
    if (!isFirstIteration) {
      let { songName, artistName } = getSongDetails(key);

      localSongs.innerHTML += `<li><img class="invert" src="./img/music.svg" alt>
        <div class="info">
          <div>${songName}</div>
          <div>${artistName}</div>
        </div>
        <img class="invert play-button" src="./img/playnow.svg" alt="">
      </li>`;
    } else {
      isFirstIteration = false;
    }
  });

  const allLiElements = localSongs.querySelectorAll("li");

  function updatePlayPauseIcon(li, isPlaying) {
    const playButton = li.getElementsByClassName("invert")[1];
    playButton.src = isPlaying ? "./img/pause.svg" : "./img/playnow.svg";
  }

  allLiElements.forEach((li) => {
    li.addEventListener("click", async () => {
      const songTitle = li.querySelector(".info").firstElementChild.innerHTML;
      const artTitle = li.querySelector(".info").lastElementChild.innerHTML;
      console.log(songTitle, artTitle);

      if (
        currSong.src !== "/songs/" + songTitle + ".mp3" &&
        currSong.src !== "/songs/" + songTitle + "%20-%20" + artTitle + ".mp3"
      ) {
        // Play the new song if it's different from the currently playing song
        playMusic(songTitle.trim(), artTitle.trim());

        // Update the play/pause icons
        updatePlayPauseIcon(li, true);

        // Pause the currently playing song if any
        if (currentlyPlayingLi) {
          const prevSongTitle =
            currentlyPlayingLi.querySelector(".info").firstElementChild
              .innerHTML;
          const prevArtTitle =
            currentlyPlayingLi.querySelector(".info").lastElementChild
              .innerHTML;
          pauseMusic(prevSongTitle.trim(), prevArtTitle.trim());
          updatePlayPauseIcon(currentlyPlayingLi, false);
        }

        currentlyPlayingLi = li;
      } else {
        // Toggle play/pause for the current song
        if (currSong.paused) {
          currSong.play().catch((error) => {
            console.error("Failed to play audio:", error);
          });
        } else {
          currSong.pause();
        }

        // Update the play/pause icons
        updatePlayPauseIcon(li, !currSong.paused);
      }
    });
  });

  play.addEventListener("click", async () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "./img/pause1.svg";
    } else {
      currSong.pause();
      play.src = "./img/play.svg";
    }
  });

  //Time update
  currSong.addEventListener("timeupdate", () => {
    // This event is triggered once
    const totalDurationElement = document.getElementById("totalDuration");
    totalDurationElement.textContent = formatTime(currSong.duration);
  });

  currSong.addEventListener("timeupdate", () => {
    // This event is triggered continuously as the audio is playing
    const durationElement = document.getElementById("duration");
    durationElement.textContent = formatTime(currSong.currentTime);
    const seekBar = document.querySelector(".seek");
    const progressBar = seekBar.querySelector(".progress-bar");
    const progress = (currSong.currentTime / currSong.duration) * 100;
    progressBar.style.width = `${progress}%`;
  });

  //Add event listener to seekbar
  
}

main();
