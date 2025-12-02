chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTH_TOKEN") {
        // Perform the asynchronous operation (storage.local.set)
        chrome.storage.local.set({ token: message.token }, () => {
            // 1. Send the response *after* the storage operation is complete.
            console.log('Token saved to storage:', message.token);
            sendResponse({ success: true, message: "Token saved to storage." });
        });

        // 2. Return TRUE to indicate that the sendResponse function
        //    will be called asynchronously, keeping the port open.
        return true;
    }
});
