const seekBar = document.querySelector(".seek");
const progressBar = document.querySelector(".progress-bar");
const volBar = document.getElementById("volBar");
const volKnob = document.getElementById("volKnob");
// const leftPanel = document.getElementById("left");
// const rightPanel = document.getElementById("right");

// const BORDER_SIZE = 0;

let currSong = new Audio();
let songs;
let currFolder;
let isRepeat = false;
let isShuffle = false;
// let startPosLeft, startPosRight;

let getSongs = async function (folder) {
  currFolder = folder;
  try {
    let response = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
    let data = await response.text();

    let parser = new DOMParser(); // Create a new instance of the DOMParser class
    let doc = parser.parseFromString(data, "text/html"); // Parse the HTML string

    // Select all <a> elements within the document
    let aElements = doc.querySelectorAll("a");

    songs = {}; // create an object to store the songs

    // Now you can loop through the selected elements
    aElements.forEach((aElement) => {
      let title = aElement.getAttribute("title"); // or .innerText to get the text content
      let href = aElement.getAttribute("href");
      if (title && href && href.endsWith(".mp3")) {
        let fileName = title.replace(".mp3", ""); // remove .mp3 from title
        songs[fileName] = href; // store href in songs object
      }
    });

    //Populates the local songs
    const localSongs = document
      .querySelector(".local-songs")
      .getElementsByTagName("ul")[0]; // get the local songs
    localSongs.innerHTML = "";

    let currentlyPlayingLi = null;
    // let isFirstIteration = true;

    Object.entries(songs).forEach(([key, value]) => {
      // if (!isFirstIteration) {
      let { songName, artistName } = getSongDetails(key); // get the song details

      localSongs.innerHTML += `<li><img class="invert mimg" src="./img/music.svg" alt>
        <div class="info">
          <div>${songName}</div>
          <div>${artistName}</div>
        </div>
        <img class="invert play-button" src="./img/playnow.svg" alt="">
      </li>`; // add the song to the local songs
      // } else {
      // isFirstIteration = false;
      // }
    });

    const allLiElements = localSongs.querySelectorAll("li");

    let len = 0;
    // add the click event listener
    allLiElements.forEach((li) => {
      len = len + 1;
      li.addEventListener("click", async () => {
        const songTitle = li.querySelector(".info").firstElementChild.innerHTML;
        const artTitle = li.querySelector(".info").lastElementChild.innerHTML;

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
    return songs;
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
};

function getSongDetails(songTitle) {
  let parts = songTitle.split("-"); // split the song title
  let artistName = parts[1] || "Unknown";
  let songName = parts[0] || "Unknown";

  return { songName, artistName };
}
async function playMusic(songTitle, artist, pause = false, callback = null) {
  let src; // create a variable to store the source

  if (
    artist === "Unknown" ||
    artist === "" ||
    artist === "null" ||
    artist === undefined
  ) {
    // if the artist is unknown

    src = `${currFolder}/` + songTitle + ".mp3"; // if the artist is unknown
  }
  // else if (songTitle.endsWith(".json")){
  //   src = `${currFolder}/` + songTitle;
  // }
  else {
    src = `${currFolder}/` + songTitle + "-" + artist + ".mp3"; // if the artist is known
  }

  if (currSong.src !== src) {
    // if the current song is not the same as the source
    currSong.src = src;
    currSong.load(); // load the song
  }

  if (isRepeat) {
    // Set the repeat attribute of the audio element
    currSong.loop = true;
  } else {
    // Remove the repeat attribute
    currSong.loop = false;
  }

  try {
    if (!pause) {
      await currSong.play(); // play the song
      play.src = "./img/pause1.svg"; // update the play button
    }
    if (artist === undefined) {
      artist = "Unknown";
    }
    document.querySelector(".song-info").innerHTML = `
    <div class="info">
      <div>🎵 ${songTitle}</div>
      <div>by - ${artist}</div>
    </div>
  `; // update the song info
    duration.innerHTML = "00:00";
    totalDuration.innerHTML = "00:00"; // update the duration and total duration
    if (callback && typeof callback === "function") {
      callback();
    }

    document.querySelector(".songInfo").innerHTML = `
    <div class="info">
      <div>🎵 ${songTitle}</div>
      <div>by - ${artist}</div>
    </div>
  `;
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
}

async function pauseMusic() {
  // pause the music
  try {
    currSong.pause();
    play.src = "./img/play1.svg";
  } catch (error) {
    console.error("Failed to pause audio:", error);
  }
}

function formatTime(seconds) {
  // format the time
  if (isNaN(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

// Function to shuffle an array using the Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to get a shuffled array of song keys from the songs object
function getShuffledKeys(songs) {
  const keys = Object.keys(songs);
  return shuffleArray(keys);
}

async function playShuffledSongs(songs) {
  const shuffledKeys = getShuffledKeys(songs);

  for (const key of shuffledKeys) {
    const { songName, artistName } = getSongDetails(key);

    playMusic(songName, artistName);

    // Add a delay if needed between playing each song
    await new Promise((resolve) => {
      currSong.addEventListener("ended", () => {
        resolve();
      });
    });
  }
}

// Event listeners
function handleDrag(e) {
  const progress = (e.offsetX / seekBar.getBoundingClientRect().width) * 100;
  progressBar.style.width = progress + "%";
  currSong.currentTime = (progress / 100) * currSong.duration;
}
function handleDragVol(e) {
  const barRect = volBar.getBoundingClientRect();
  const offsetX = e.clientX - barRect.left;

  const validOffsetX = Math.min(barRect.width, Math.max(0, offsetX));

  const percentage = (validOffsetX / barRect.width) * 100;

  // Ensure the percentage is within 0 to 100
  const validPercentage = Math.min(100, Math.max(0, percentage));
  volKnob.style.left = `${validPercentage}%`;
  // Do something with the volume based on the validPercentage (e.g., update audio volume)
  const volume = validPercentage / 100;

  if (currSong) {
    currSong.volume = volume;
  }

  if (0.1 <= volume && volume <= 0.5) {
    document.getElementById("volImg").src = "./img/volumeL.svg";
  } else if (0.51 <= volume && volume <= 1.0) {
    document.getElementById("volImg").src = "./img/volumeH.svg";
  } else {
    document.getElementById("volImg").src = "./img/mute.svg";
  }
}

// function resizeLeft(e) {
//   const dx = startPosLeft - e.clientX;
//   startPosLeft = e.clientX;
//   leftPanel.style.width = `${parseInt(getComputedStyle(leftPanel).width) + dx}px`;
//   rightPanel.style.width = `${parseInt(getComputedStyle(rightPanel).width) - dx}px`;
// }

// function resizeRight(e) {
//   const dx = startPosRight - e.clientX;
//   startPosRight = e.clientX;
//   rightPanel.style.width = `${parseInt(getComputedStyle(rightPanel).width) + dx}px`;
//   leftPanel.style.width = `${parseInt(getComputedStyle(leftPanel).width) - dx}px`;
// }

async function displayAlbum() {
  try {
    const response = await fetch("http://127.0.0.1:5500/songs/");
    const data = await response.text();

    const div = document.createElement("div");
    div.innerHTML = data;
    const anchors = div.getElementsByTagName("a");
    const cardContainer = document.querySelector(".boxes");

    const fetchPromises = Array.from(anchors)
      .filter((a) => a.href.includes("/songs/"))
      .map((a) => {
        const folders = a.href.split("/").slice(-2)[1];

        return fetch(`http://127.0.0.1:5500/songs/${folders}/info.json`)
          .then((response) => response.json())
          .then((data) => {
            cardContainer.innerHTML += `
              <div data-folder="${folders}" class="card rounded">
                <div class="play flex align-centre">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" class="injected-svg" data-src="/icons/play-stroke-sharp.svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" fill="#000"></path>
                  </svg>
                </div>
                <img class="rounded" src="/songs/${folders}/cover.jpeg" alt />
                <div id="info">
                  <h3>${data.title}</h3>
                  <span>${data.description}</span>
                </div>
              </div>`;
          })
          .catch((error) =>
            console.error(`Error fetching JSON from folder ${folders}:`, error)
          );
      });

    await Promise.all(fetchPromises);

    // Add click event listener to each card
    const cardElements = document.getElementsByClassName("card");
    for (const cardElement of cardElements) {
      cardElement.addEventListener("click", async () => {
        const folderValue = cardElement.dataset.folder;
        songs = await getSongs(`songs/${folderValue}`);

        const playButton = cardElement.querySelector(".play"); // get the play button within the card

        // left.style.display = "block";

        left.style.left = "0";

        playButton.addEventListener("click", async () => {
          // Play the first song
          let firstSong = Object.keys(songs)[0]; // get the first song

          let [songName, artistName] = firstSong.split("-");
          playMusic(songName, artistName); // play the first song
        });
      });
    }
  } catch (error) {
    console.error("Error in displayAlbum function:", error);
  }
}

async function main() {

  //Display all the albums DYNAMICALLY
  displayAlbum();

  //Play and pause
  function updatePlayPauseIcon(li, isPlaying) {
    // update the play/pause icon
    const playButton = li.getElementsByClassName("invert")[1];
    playButton.src = isPlaying ? "./img/pausenow.svg" : "./img/playnow.svg";
  }

  play.addEventListener("click", async () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "./img/pause1.svg";
    } else {
      currSong.pause();
      play.src = "./img/play1.svg";
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
    if (currSong.currentTime == currSong.duration) {
      play.src = "./img/play1.svg";
    }
  });

  // Add event listener to seekbar -- CLICK & DRAG
  let isDragging = false;

  seekBar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    handleDrag(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      handleDrag(e);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  //Add event listner for shuffle
  shuffle.addEventListener("click", async () => {
    isShuffle = !isShuffle;
    if (isShuffle) {
      shuffle.src = "./img/shuffleOn.svg";
      await playShuffledSongs(songs);
      isShuffle = true;
    } else {
      shuffle.src = "./img/shuffle.svg";
      isShuffle = false;
    }
  });

  //Add event listener for repeat
  repeat.addEventListener("click", async () => {
    isRepeat = !isRepeat;
    if (isRepeat) {
      repeat.src = "./img/repeat1.svg";
      currSong.loop = true;
    } else {
      repeat.src = "./img/repeat.svg";
      currSong.loop = false;
    }
  });

  //Add event listener for previous
  prev.addEventListener("click", async () => {
    const index = Object.values(songs).indexOf(
      `/songs/${currFolder}` + currSong.src.split("/").slice(-1)[0]
    );

    if (index > 0) {
      const prevSong = Object.keys(songs)[index - 1];

      const { songName, artistName } = getSongDetails(prevSong);
      playMusic(songName, artistName);
    } else {
      // If the current song is the first one, play the last song in the list
      const keys = Object.keys(songs);
      const lastSong = keys[keys.length - 1];
      const { songName, artistName } = getSongDetails(lastSong);
      playMusic(songName, artistName);
    }
  });

  //Add event listener for next
  next.addEventListener("click", async () => {
    const index = Object.values(songs).indexOf(
      `/songs/${currFolder}` + currSong.src.split("/").slice(-1)[0]
    );

    if (index < Object.keys(songs).length - 2) {
      const nextSong = Object.keys(songs)[index + 1];

      const { songName, artistName } = getSongDetails(nextSong);
      playMusic(songName, artistName);
    } else {
      // If the current song is the last one, play the first song in the list
      const firstSong = Object.keys(songs)[0];
      const { songName, artistName } = getSongDetails(firstSong);
      playMusic(songName, artistName);
    }
  });

  //Add event listener for volume
  let isDrag = false;

  volBar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDrag = true;
    handleDragVol(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDrag) {
      handleDragVol(e);
    }
  });

  document.addEventListener("mouseup", () => {
    isDrag = false;
  });

  //Add event listener for volume
  let isMute = false;
  volImg.addEventListener("click", () => {
    isMute = !isMute;
    if (isMute) {
      volImg.src = "./img/mute.svg";
      volKnob.style.left = `${0}%`;
      currSong.volume = 0;
    } else {
      currSong.volume = 1;
      volKnob.style.left = `${95}%`;
      volImg.src = "./img/volumeH.svg";
    }
  });

  //Make dynamic RIGHT and LEFT div

  // leftPanel.addEventListener("mousedown", (e) => {
  //   const handleLeft = leftPanel.getBoundingClientRect().left;
  //   if (e.clientX - handleLeft < BORDER_SIZE) {
  //     startPosLeft = e.clientX;
  //     document.addEventListener("mousemove", resizeLeft);
  //   }
  // });

  // rightPanel.addEventListener("mousedown", (e) => {
  //   const handleLeft = rightPanel.getBoundingClientRect().left;
  //   if (e.clientX - handleLeft < BORDER_SIZE) {
  //     startPosRight = e.clientX;
  //     document.addEventListener("mousemove", resizeRight);
  //   }
  // });

  // document.addEventListener("mouseup", () => {
  //   document.removeEventListener("mousemove", resizeLeft);
  //   document.removeEventListener("mousemove", resizeRight);
  // });

  //Add event listner for close button
  closeBtn.addEventListener("click", () => {
    left.style.left = "-100%";
  });

  //Add event listner for minimize button
  let isClicked = false;
  up.addEventListener("click", () => {

    let more = document.querySelector(".more");
    let sInfo = document.querySelector(".song-info");

    if (!isClicked) {
      popupContent.style.top = "-100px";
      popupContent.style.right = "18px";

      more.style.display = "block";
      more.style.position = "absolute";

      sInfo.style.display = "block";
      sInfo.style.position = "absolute";

      up.src = "./img/down.svg";
      isClicked = true;
    } else {
      isClicked = false;
      popupContent.style.top = "100px";

      more.style.display = "none";
      sInfo.style.display = "none";
      up.src = "./img/up.svg";
    }
  });

  //Time
  let date = new Date();
  let time = date.getHours();

  let h2 = document.querySelector(".head h2");
  if (time >= 4 && time < 11) {
    h2.innerHTML = "Good Morning";
  } else if (time >= 11 && time < 16) {
    h2.innerHTML = "Good Afternoon";
  } else if (time >= 16 && time < 20) {
    h2.innerHTML = "Good Evening";
  } else {
    h2.innerHTML = "Good Night";
  }
}
main();

function applyStylesForScreenWidth() {
  const screenWidth = window.innerWidth;

  if (screenWidth <= 390) {
    document.querySelector('.song-info').style.cssText = 'left: 39%; top: -116%; width: 149px;';
    document.querySelector('.more').style.cssText = 'left: 49%; top: -51%;';
    document.querySelector('.play').style.top = '58%';
    document.querySelector('#duration, #totalDuration').style.fontSize = '12px';
    document.querySelector('#duration').style.right = '-5px';
    document.querySelector('#totalDuration').style.left = '9px';
    document.querySelector('.pad').style.padding = '0px 8px';
  }

  if (screenWidth <= 360) {
    document.querySelector('.song-info').style.cssText = 'left: 36%; top: -115%; width: 154px;';
    document.querySelector('.more').style.cssText = 'left: 45%; top: -53%;';
  }

  if (screenWidth <= 340) {
    document.querySelector('.song-info').style.cssText = 'left: 32%; top: -144%; width: 153px;';
    document.querySelector('.more').style.cssText = 'left: 42%; top: -63%;';
    document.querySelector('.song-nav img').style.cssText = 'width: 20px; height: 20px;';
    document.querySelector('#up').style.cssText = 'right: 7px; top: 25px;';
    document.querySelector('.play').style.top = '55%';
  }

  if (screenWidth <= 300) {
    document.querySelector('.song-info').style.cssText = 'left: 22%; top: -143%; width: 162px;';
    document.querySelector('.more').style.cssText = 'left: 34%; top: -65%;';
    document.querySelector('#up').style.right = '-5px';
    document.querySelector('.seek').style.marginLeft = '64px';
    document.querySelectorAll('.btn-1, .btn').forEach(btn => {
      btn.style.fontSize = '10px';
      // Uncomment the following lines if you want to set width and height
      // btn.style.width = '50px';
      // btn.style.height = '10px';
    });
    document.querySelector('.logo2 img').style.width = '70px';
  }
}

// Initial application of styles on page load
applyStylesForScreenWidth();

// Listen for screen width changes and reapply styles
window.addEventListener('resize', applyStylesForScreenWidth);