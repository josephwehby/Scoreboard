function insertScores(ratings) {

  const container = document.querySelector(".videoMetadata--container");
  const scores = document.createElement("div");
  container.appendChild(scores);

  scores.style.display = "flex";
  scores.style.gap = "20px";
  scores.style.width = "100%";

  for (const [source, score] of Object.entries(ratings)) {
    const inner_score = document.createElement("div");
    scores.appendChild(inner_score);

    let image = "icons/";
    if (source === "Rotten Tomatoes") {
      image += "rotten-tomatoes.png";
    } else if (source === "Internet Movie Database") {
      image += "imdb.png";
    } else if (source === "Metacritic") {
      image += "metacritic.png";
    }

    console.log(image);

    const source_tag = document.createElement("img");
    source_tag.src = browser.runtime.getURL(image);
    source_tag.style.height = "24px";
    source_tag.style.width = "auto";

    const score_tag = document.createElement("h3");
    score_tag.textContent = score;

    inner_score.appendChild(source_tag);
    inner_score.appendChild(score_tag);

    inner_score.style.display = "flex";
    inner_score.style.alignItems = "center";
    inner_score.style.gap = "5px";
  }

}

async function fetchMovieScore(title) {
  let url = "http://www.omdbapi.com/?apikey=[KEY]&t=";
  const cleanTitle = encodeURIComponent(title.replace(/ /g, "+"));
  url += cleanTitle;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const ratings = data.Ratings;

    const ratingDict = {
      "Rotten Tomatoes": "_%", 
      "Internet Movie Database": "_/10", 
      "Metacritic" : "_/100"
    };

    ratings.forEach(rating => {
      if (ratingDict.hasOwnProperty(rating.Source)) {
        ratingDict[rating.Source] = rating.Value;
      }
    }); 

    insertScores(ratingDict);
  } catch (err) {
    console.error("failed");
    return {};
  }
}

let lastTitle = "";
let open = false;

const observer = new MutationObserver(() => {
  const about_header = document.querySelector("div.about-header");
  if (!open && about_header) {
    open = true;
    const about = about_header.querySelector("h3");
    const title = about.querySelector("strong");
    if (title) {
      lastTitle = title.textContent.trim();
      fetchMovieScore(lastTitle);
    }

  } else if (open && !about_header){
    open = false;
    lastTitle = "";
  }

});

observer.observe(document.body, { childList: true, subtree: true });
