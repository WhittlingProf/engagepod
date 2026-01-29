const APIFY_TOKEN = process.env.APIFY_TOKEN;

// LinkedIn URL patterns
const LINKEDIN_POST_PATTERNS = [
  /^https?:\/\/(www\.)?linkedin\.com\/posts\/.+/,
  /^https?:\/\/(www\.)?linkedin\.com\/feed\/update\/urn:li:(activity|share):\d+/,
  /^https?:\/\/(www\.)?linkedin\.com\/pulse\/.+/
];

/**
 * Validate that a URL is a valid LinkedIn post URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL matches LinkedIn post patterns
 */
export function isValidLinkedInUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return LINKEDIN_POST_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Verify that a LinkedIn post exists using Apify
 * @param {string} url - The LinkedIn post URL
 * @returns {Object} - Validation result with success status and details
 */
export async function verifyLinkedInPost(url) {
  // First check URL format
  if (!isValidLinkedInUrl(url)) {
    return {
      valid: false,
      error: 'Invalid LinkedIn post URL format. URL must be a LinkedIn post, update, or article.'
    };
  }

  // If no Apify token, skip deep validation
  if (!APIFY_TOKEN) {
    console.warn('APIFY_TOKEN not set, skipping deep validation');
    return {
      valid: true,
      warning: 'Deep validation skipped (no Apify token)',
      url
    };
  }

  try {
    // Use Apify's LinkedIn Post Scraper actor
    const actorId = 'curious_coder~linkedin-post-search-scraper';
    const apiUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_TOKEN}`
      },
      body: JSON.stringify({
        urls: [url],
        maxItems: 1
      })
    });

    if (!response.ok) {
      // If Apify fails, allow the post through with a warning
      console.warn('Apify validation failed, allowing post:', response.statusText);
      return {
        valid: true,
        warning: 'Could not verify post exists (Apify error)',
        url
      };
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        valid: true,
        url,
        postData: {
          author: data[0].authorName || data[0].author,
          text: data[0].text?.substring(0, 100)
        }
      };
    }

    return {
      valid: false,
      error: 'LinkedIn post not found or not accessible'
    };

  } catch (err) {
    console.error('Apify validation error:', err);
    // On error, allow the post through with a warning
    return {
      valid: true,
      warning: 'Could not verify post exists (network error)',
      url
    };
  }
}
