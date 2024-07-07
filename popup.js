document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ action: "fetchLyrics" });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.lyrics) {
    console.log(message)
    const content = `Song: ${message.title}\nBy: ${message.artist}\n\n ${message.lyrics}`;
    document.getElementById("lyrics").textContent = content;
  }
});
