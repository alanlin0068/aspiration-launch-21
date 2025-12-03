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

// Function to create and show the donation popup
function showDonationPopup(price) {
    if (popupShown) return;
    popupShown = true;

    const roundUp = Math.ceil(price) - price;

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
    padding: 32px;
    max-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    </style>
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🌱</div>
      <h2 style="margin: 0 0 8px 0; font-size: 24px; color: #1a1a1a;">Make an Impact?</h2>
      <p style="color: #666; margin: 0 0 24px 0; font-size: 14px;">Round up your purchase to donate the difference</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #666;">Purchase Price:</span>
          <span style="font-weight: 600;">$${price.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #666;">Rounded Up:</span>
          <span style="font-weight: 600;">$${Math.ceil(price).toFixed(2)}</span>
        </div>
        <div style="height: 1px; background: #ddd; margin: 12px 0;"></div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #10b981; font-weight: 600;">Donation:</span>
          <span style="font-size: 20px; color: #10b981; font-weight: 700;">$${roundUp.toFixed(2)}</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="aspiration-donate" style="
          flex: 1;
          background: #10b981;
          color: white;
        ">
          Donate $${roundUp.toFixed(2)}
        </button>
        <button id="aspiration-skip" style="
          flex: 1;
          background: #e5e5e5;
          color: #666;
        ">
          Skip
        </button>
      </div>

      <p style="margin-top: 16px; font-size: 12px; color: #999;">
        Powered by <a href="http://localhost:8080/dashboard" target="_blank" style="color: #10b981; text-decoration: none; font-weight: 500;">Aspiration</a>
      </p>
    </div>
  `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Handle donate button
    document.getElementById('aspiration-donate').addEventListener('click', async () => {
        await processDonation(price, roundUp);
        overlay.remove();
    });

    // Handle skip button
    document.getElementById('aspiration-skip').addEventListener('click', () => {
        overlay.remove();
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