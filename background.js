chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchLyrics") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (
        activeTab &&
        activeTab.url &&
        activeTab.url.startsWith("https://open.spotify.com/")
      ) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: findTitleAndFetchLyrics,
        });
      } else {
        console.log("Not a Spotify tab");
      }
    });
  }
});

async function findTitleAndFetchLyrics() {
  const element = document.querySelector(".eSMjmiD29Ox35O95waw6");
  if (element) {
    const trackName = element.getAttribute("title");
    const artist = document.querySelector(
      '[data-testid="context-item-info-artist"]',
    ).textContent;
    if (trackName) {
      try {
        const response = await fetch(
          `https://lyrist.vercel.app/api/${encodeURIComponent(trackName)}/${encodeURIComponent(artist)}`,
        );
        const data = await response.json();
        chrome.runtime.sendMessage({
          title: data.title,
          artist: data.artist,
          lyrics: data.lyrics,
        });
      } catch (error) {
        console.error("Error fetching lyrics:", error);
      }
    } else {
      console.error("No title attribute found for the element.");
    }
  } else {
    console.error("Element not found.");
  }

  // Listen for changes in the class to update lyrics
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(async (mutation) => {
      if (mutation.attributeName === "class") {
        const updatedTrackName = element.getAttribute("title");
        if (updatedTrackName && updatedTrackName !== trackName) {
          try {
            const response = await fetch(
              `https://lyrist.vercel.app/api/${encodeURIComponent(updatedTrackName)}`,
            );
            const data = await response.json();
            chrome.runtime.sendMessage({ lyrics: data.lyrics });
          } catch (error) {
            console.error("Error fetching updated lyrics:", error);
          }
        }
      }
    });
  });

  observer.observe(element, { attributes: true });
}
