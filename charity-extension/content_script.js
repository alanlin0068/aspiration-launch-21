// 1. Listen for messages from the web page (sent via window.postMessage)
window.addEventListener("message", (event) => {
    // Always check the origin and the message source for security
    if (event.source !== window) {
        console.log("source not window", event.source);
        return
    };
    if (event.data.source !== "aspiration-auth") {
        console.log("source not aspiration-auth", event.data.source);
        return
    };
    if (event.data.type !== "AUTH_TOKEN") {
        console.log("type not AUTH_TOKEN", event.data.type);
        return;
    }

    // 2. Relay the message using the Chrome API to the background/service worker
    chrome.runtime.sendMessage(
        {
            type: "AUTH_TOKEN", // A new type to indicate it came from the web page
            token: event.data.token
        },
        (response) => {
            console.log("Content Script received response from background:", response);
        }
    );
});