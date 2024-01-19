let getSongs = async function () {
  try {
    let response = await fetch("http://127.0.0.1:5500/songs");
    let data = await response.text();
    // console.log(data);

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
async function main() {
  let songs = await getSongs();
  console.log(songs);

  const localSongs = document
    .querySelector(".local-songs")
    .getElementsByTagName("ul")[0];

  let isFirstIteration = true;

  Object.entries(songs).forEach(([key, value]) => {
    if (!isFirstIteration) {
      let { songName, artistName } = getSongDetails(key);

      localSongs.innerHTML += `<li><img class="invert" src="./img/music.svg" alt>
        <div class="info">
          <div>${songName}</div>
          <div>${artistName}</div>
        </div>
        <img class="invert" src="./img/playnow.svg" alt="">
      </li>`;
    } else {
      isFirstIteration = false;
    }
  });
  //   const selectedSongKey = "Love Dose"; // Replace with the actual filename
  //   const selectedSongUrl = songs[selectedSongKey];

  //   if (selectedSongUrl) {
  //     const audio = new Audio(selectedSongUrl);
  //     // audio.play();
  //   }
}

main();
