
import { AudioPlayer } from "./player";

const player = new AudioPlayer();

// Attach event listeners to all mood buttons
document.querySelectorAll(".mood-button").forEach(btn => {
  btn.addEventListener("click", async () => {
    const mood = btn.getAttribute("data-mood") || "calm";

    try {
      const response = await fetch(`/api/recommend?mood=${mood}`);
      const track = await response.json();

      if (track && track.stream_url) {
        player.play(track.stream_url);
      } else {
        alert("No playable track available for this mood.");
      }
    } catch (err) {
      console.error("Failed to fetch or play track:", err);
      alert("Something went wrong fetching music.");
    }
  });
});
