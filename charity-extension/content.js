chrome.runtime.sendMessage({ type: "AMAZON_PAGE_DETECTED" });
// amazon_detector.js - Content script for detecting Amazon purchases

const SUPABASE_URL = "https://mrfhflecdwruekaxsfqf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZmhmbGVjZHdydWVrYXhzZnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjI4NTYsImV4cCI6MjA3OTU5ODg1Nn0.nj9eohF2tR877h899xzI5CUBvk9AaI6rZKFyxVsulbY";

// Track if we've already shown popup for this page
let popupShown = false;

// Function to extract price from Amazon product page
function extractAmazonPrice() {
    // Amazon uses different price selectors, try them in order
    const priceSelectors = [
        '.a-text-bold .order-summary-line-definition',
        '.a-price .a-offscreen',           // Most common
        '#priceblock_ourprice',             // Older format
        '#priceblock_dealprice',            // Deal price
        '.a-price-whole',                   // Whole number part
        '#price_inside_buybox',             // Buy box price
        '[data-a-color="price"]',           // Alternative
    ];

    for (const selector of priceSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            let priceText = element.textContent.trim();
            console.log(priceText);
            // Extract numeric value (remove $, commas, etc.)
            const match = priceText.match(/[\d,]+\.?\d*/);
            console.log(match);
            if (match) {
                const price = parseFloat(match[0].replace(/,/g, ''));
                console.log("Extracted price:", price);
                if (price > 0) {
                    return price;
                }
            }
        }
    }

    return null;
}

// Function to check if we're on an Amazon Checkout page
function isAmazonCheckoutPage() {
    const url = window.location.href;
    // Check if URL contains /dp/ or /gp/product/ (Amazon product identifiers)
    return url.includes('amazon.com') && (url.includes('/checkout/'));
}

// Function to get tree stage and progress info
function getTreeInfo(totalDonated) {
    const milestones = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let currentStage = 1;
    let currentMilestone = 1;
    let previousMilestone = 0;
    
    for (let i = 0; i < milestones.length; i++) {
        if (totalDonated >= milestones[i]) {
            currentStage = i + 2;
            previousMilestone = milestones[i];
            currentMilestone = milestones[i + 1] || milestones[i];
        } else {
            currentMilestone = milestones[i];
            break;
        }
    }
    
    currentStage = Math.min(currentStage, 10);
    const progress = previousMilestone === currentMilestone 
        ? 100 
        : ((totalDonated - previousMilestone) / (currentMilestone - previousMilestone)) * 100;
    const toNextStage = Math.max(0, currentMilestone - totalDonated);
    
    return { currentStage, progress, toNextStage, currentMilestone };
}

// Function to fetch user's total donations
async function fetchUserTotalDonations(token) {
    try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "apikey": SUPABASE_ANON_KEY
            }
        });
        if (!userRes.ok) return 0;
        const user = await userRes.json();
        
        const donationsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/donations?select=amount&user_id=eq.${user.id}&status=eq.completed`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "apikey": SUPABASE_ANON_KEY
                }
            }
        );
        if (!donationsRes.ok) return 0;
        const donations = await donationsRes.json();
        return donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    } catch (e) {
        console.error("Error fetching donations:", e);
        return 0;
    }
}

// Function to create and show the donation popup
async function showDonationPopup(price) {
    if (popupShown) return;
    popupShown = true;

    const roundUp = Math.ceil(price) - price;
    
    // Fetch user's tree progress
    const result = await chrome.storage.local.get("token");
    const token = result.token;
    const totalDonated = token ? await fetchUserTotalDonations(token) : 0;
    const treeInfo = getTreeInfo(totalDonated);
    
    // Tree image URL (using GitHub raw or local extension assets)
    const treeImageUrl = chrome.runtime.getURL(`images/stage${treeInfo.currentStage}.png`);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'aspiration-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in;
  `;

    // Create popup card
    const popup = document.createElement('div');
    popup.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
  `;

    popup.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #aspiration-overlay button {
        cursor: pointer;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.2s;
      }
      #aspiration-overlay button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      #aspiration-close-btn {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 28px;
        height: 28px;
        padding: 0;
        background: #f5f5f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #666;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }
      #aspiration-close-btn:hover {
        background: #e5e5e5;
        transform: none;
        box-shadow: none;
      }
      #aspiration-more-options {
        margin-top: 12px;
        text-align: center;
      }
      #aspiration-more-options summary {
        cursor: pointer;
        color: #666;
        font-size: 13px;
        list-style: none;
        padding: 8px;
      }
      #aspiration-more-options summary::-webkit-details-marker {
        display: none;
      }
      #aspiration-more-options summary::after {
        content: ' ▼';
        font-size: 10px;
      }
      #aspiration-more-options[open] summary::after {
        content: ' ▲';
      }
      .aspiration-quick-amounts {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        justify-content: center;
      }
      .aspiration-quick-amount {
        padding: 8px 16px !important;
        background: #f5f5f5 !important;
        color: #333 !important;
        font-size: 14px !important;
        border: 1px solid #ddd !important;
      }
      .aspiration-quick-amount:hover {
        background: #e8f5e9 !important;
        border-color: #10b981 !important;
        color: #10b981 !important;
      }
      .aspiration-custom-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        align-items: center;
      }
      .aspiration-custom-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
      }
      .aspiration-custom-input:focus {
        border-color: #10b981;
      }
      .aspiration-custom-donate {
        padding: 10px 16px !important;
        background: #10b981 !important;
        color: white !important;
        font-size: 14px !important;
      }
    </style>
    
    <button id="aspiration-close-btn">×</button>
    
    <div style="text-align: center;">
      <!-- Tree and Progress Section -->
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
        <img src="${treeImageUrl}" alt="Your Impact Tree" style="width: 80px; height: 80px; object-fit: contain;" />
        <div style="flex: 1; text-align: left;">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Stage ${treeInfo.currentStage}/10</div>
          <div style="background: #e5e5e5; border-radius: 10px; height: 8px; overflow: hidden;">
            <div style="background: #333; height: 100%; width: ${treeInfo.progress}%; transition: width 0.3s;"></div>
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 4px;">$${treeInfo.toNextStage.toFixed(2)} to next stage</div>
        </div>
      </div>
      
      <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1a1a1a;">Make an Impact?</h2>
      <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">Round up your purchase to donate the difference</p>
      
      <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">Purchase Price:</span>
          <span style="font-weight: 600;">$${price.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #666;">Rounded Up:</span>
          <span style="font-weight: 600;">$${Math.ceil(price).toFixed(2)}</span>
        </div>
        <div style="height: 1px; background: #ddd; margin: 10px 0;"></div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #10b981; font-weight: 600;">Donation:</span>
          <span style="font-size: 18px; color: #10b981; font-weight: 700;">$${roundUp.toFixed(2)}</span>
        </div>
      </div>

      <button id="aspiration-donate" style="
        width: 100%;
        background: #10b981;
        color: white;
      ">
        Donate $${roundUp.toFixed(2)}
      </button>
      
      <details id="aspiration-more-options">
        <summary>More donation options</summary>
        <div class="aspiration-quick-amounts">
          <button class="aspiration-quick-amount" data-amount="1">$1</button>
          <button class="aspiration-quick-amount" data-amount="5">$5</button>
          <button class="aspiration-quick-amount" data-amount="10">$10</button>
        </div>
        <div class="aspiration-custom-row">
          <span style="color: #666;">$</span>
          <input type="number" class="aspiration-custom-input" id="aspiration-custom-amount" placeholder="Custom amount" step="0.01" min="0.01" />
          <button class="aspiration-custom-donate" id="aspiration-custom-donate-btn">Donate</button>
        </div>
      </details>

      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        Powered by <a href="http://localhost:8080/dashboard" target="_blank" style="color: #10b981; text-decoration: none; font-weight: 500;">Aspiration</a>
      </p>
    </div>
  `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Handle close button
    document.getElementById('aspiration-close-btn').addEventListener('click', () => {
        overlay.remove();
    });

    // Handle main donate button (roundup amount)
    document.getElementById('aspiration-donate').addEventListener('click', async () => {
        await processDonation(price, roundUp);
        overlay.remove();
    });

    // Handle quick amount buttons ($1, $5, $10)
    document.querySelectorAll('.aspiration-quick-amount').forEach(btn => {
        btn.addEventListener('click', async () => {
            const amount = parseFloat(btn.dataset.amount);
            await processDonation(price, amount);
            overlay.remove();
        });
    });

    // Handle custom amount donation
    document.getElementById('aspiration-custom-donate-btn').addEventListener('click', async () => {
        const customInput = document.getElementById('aspiration-custom-amount');
        const amount = parseFloat(customInput.value);
        if (amount && amount > 0) {
            await processDonation(price, amount);
            overlay.remove();
        } else {
            customInput.style.borderColor = '#ef4444';
        }
    });

    // Close on overlay click (outside popup)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Function to process the donation
async function processDonation(purchaseAmount, roundUpAmount) {
    try {
        // Get stored auth token
        const result = await chrome.storage.local.get("token");
        const token = result.token;

        if (!token) {
            alert("Please log in to Aspiration to make donations.");
            chrome.runtime.sendMessage({ type: "OPEN_WEBAPP" });
            return;
        }

        // Get the logged in user
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "apikey": SUPABASE_ANON_KEY
            }
        });

        if (!userRes.ok) {
            throw new Error("Authentication failed");
        }

        const user = await userRes.json();

        // Get user's selected charity
        const selectionRes = await fetch(
            `${SUPABASE_URL}/rest/v1/user_charity_selections?user_id=eq.${user.id}&select=charity_id&limit=1`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "apikey": SUPABASE_ANON_KEY,
                    "Accept": "application/vnd.pgrst.object+json"
                }
            }
        );

        const selection = await selectionRes.json();

        if (!selection || !selection.charity_id) {
            alert("Please select a charity in the Aspiration app first.");
            chrome.runtime.sendMessage({ type: "OPEN_WEBAPP" });
            return;
        }

        // Insert donation
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/donations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "apikey": SUPABASE_ANON_KEY,
                "Prefer": "return=representation"
            },
            body: JSON.stringify({
                user_id: user.id,
                charity_id: selection.charity_id,
                amount: roundUpAmount,
                type: "round-up",
                status: "completed",
            })
        });

        if (!insertRes.ok) {
            const error = await insertRes.text();
            console.error("Donation failed:", error);
            throw new Error("Failed to record donation");
        }

        // Show success message
        showSuccessMessage(roundUpAmount);

    } catch (error) {
        console.error("Error processing donation:", error);
        alert("Failed to process donation. Please try again.");
    }
}

// Function to show success message
function showSuccessMessage(amount) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `;

    successDiv.innerHTML = `
    <style>
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    </style>
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 24px;">✓</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Donation Successful!</div>
        <div style="font-size: 14px; opacity: 0.9;">$${amount.toFixed(2)} donated to your chosen charity</div>
      </div>
    </div>
  `;

    document.body.appendChild(successDiv);

    // Remove after 4 seconds
    setTimeout(() => {
        successDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => successDiv.remove(), 300);
    }, 4000);
}

// Main initialization
function init() {
    // Only run on Amazon Checkout pages
    if (!isAmazonCheckoutPage()) {
        return;
    }

    // Wait for page to fully load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndShowPopup);
    } else {
        detectAndShowPopup();
    }
}

function detectAndShowPopup() {
    // Give Amazon a moment to render the price
    setTimeout(() => {
        const price = extractAmazonPrice();

        if (price) {
            console.log("Aspiration: Detected Amazon product price:", price);
            showDonationPopup(price);
        } else {
            console.log("Aspiration: Could not detect price on this page");
        }
    }, 500);
}

// Run on page load and on URL changes (for single-page navigation)
init();

// Listen for URL changes (Amazon uses client-side routing)
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        popupShown = false; // Reset for new page
        init();
    }
}).observe(document, { subtree: true, childList: true });