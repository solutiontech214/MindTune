
export class AudioPlayer {
  private audioElement: HTMLAudioElement;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.controls = true;
    this.audioElement.style.position = "fixed";
    this.audioElement.style.bottom = "10px";
    this.audioElement.style.left = "10px";
    this.audioElement.style.zIndex = "1000";
    document.body.appendChild(this.audioElement);
  }

  play(url: string) {
    if (!url) {
      alert("No audio available for this track.");
      return;
    }
    this.audioElement.src = url;
    this.audioElement.play().catch(err => {
      console.error("Audio play error:", err);
      alert("Failed to play audio.");
    });
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
  }
}
