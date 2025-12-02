// Load auth token
chrome.storage.local.get("token", ({ token }) => {
    const status = document.getElementById("status");
    const loginSection = document.getElementById("login-section");
    const logoutBtn = document.getElementById("logout-btn");

    if (token) {
        status.innerText = "Connected to your account";
        loginSection.style.display = "none";
        logoutBtn.style.display = "block"; 
    } else {
        status.innerText = "Log in on the web app.";
        loginSection.style.display = "block";
        logoutBtn.style.display = "none";
    }
});
document.getElementById("title").onclick = () => {
    chrome.tabs.create({
        url: "http://localhost:8080/"
    });
};
document.getElementById("open-webapp").onclick = () => {
    chrome.tabs.create({
        url: "http://localhost:8080/"
    });
};

// Logout button handler
document.getElementById("logout-btn").onclick = async () => {
    if (confirm("Are you sure you want to log out?")) {
        await chrome.storage.local.remove("token");

        // Update UI
        const status = document.getElementById("status");
        const loginSection = document.getElementById("login-section");
        const logoutBtn = document.getElementById("logout-btn");

        status.innerText = "Log in on the web app.";
        loginSection.style.display = "block";
        logoutBtn.style.display = "none";
    }
};

// Handle simulation
document.getElementById("simulate").onclick = () => {
    const amount = parseFloat(document.getElementById("amount").value);
    const roundup = Math.ceil(amount) - amount;

    document.getElementById("roundup").innerText =
        `Round-Up Donation: $${roundup.toFixed(2)}`;

    document.getElementById("donate").style.display = "block";
};

const supabase_url = "https://mrfhflecdwruekaxsfqf.supabase.co";
const supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZmhmbGVjZHdydWVrYXhzZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjI4NTYsImV4cCI6MjA3OTU5ODg1Nn0.nj9eohF2tR877h899xzI5CUBvk9AaI6rZKFyxVsulbY";
// Load session token into Supabase client
document.getElementById("donate").onclick = async () => {
    const { token } = await chrome.storage.local.get("token");
    if (!token) {
        alert("You must log in from the web app first.");
        return;
    }

    const amount = parseFloat(document.getElementById("amount").value);
    const roundup = Math.ceil(amount) - amount;

    // Get the logged in user
    const userRes = await fetch(`${supabase_url}/auth/v1/user`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": supabase_anon_key
        }
    });

    const user = await userRes.json();

    // Get user's selected charity
    const selectionRes = await fetch(`${supabase_url}/rest/v1/user_charity_selections?user_id=eq.${user.id}&select=*`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": supabase_anon_key
        }
    });
    console.log(selectionRes);
    const selections = await selectionRes.json();
    // ✅ Check if user has a charity selected
    if (!selections || selections.length === 0) {
        alert("Please select a charity in the web app first!");
        return;
    }

    // ✅ Get the first (or most recent) selection
    const selection = selections[0];
    // Insert donation
    const insertRes = await fetch(`${supabase_url}/rest/v1/donations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "apikey": supabase_anon_key,
            "Prefer": "return=representation"
        },
        body: JSON.stringify({
            user_id: user.id,
            charity_id: selection.charity_id,
            amount: roundup,
            type: "round-up",
            status: "completed",
        })
    });

    if (!insertRes.ok) {
        console.error(await insertRes.text());
        alert("Donation failed!");
    } else {
        alert("Donation recorded!");
    }
};
