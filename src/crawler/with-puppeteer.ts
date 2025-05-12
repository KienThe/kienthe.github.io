import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'https://backend.metruyencv.com/api';
const RESULTS_DIR = '/app/crawl-results';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

async function crawlWithPuppeteer() {
  console.log('Starting crawler...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  console.log('Browser launched successfully');

  try {
    const page = await browser.newPage();
    console.log('New page created');
    
    // Set headers to mimic browser
    await page.setExtraHTTPHeaders({
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    console.log('Headers set');

    // Enable request interception
    await page.setRequestInterception(true);
    console.log('Request interception enabled');

    page.on('request', request => {
      console.log(`Intercepted request: ${request.url()}`);
      request.continue();
    });

    page.on('response', response => {
      console.log(`Received response: ${response.url()} - Status: ${response.status()}`);
    });

    // Function to make API requests
    const makeApiRequest = async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => {
      try {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });

        console.log(`Making request to: ${url.toString()}`);

        const response = await page.evaluate(async (url) => {
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          return res.json();
        }, url.toString());

        // Save response to file
        const fileName = `${endpoint.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
        const filePath = path.join(RESULTS_DIR, fileName);
        fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
        console.log(`Saved response to: ${filePath}`);

        return response as T;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
    }

    // Example API calls
    const endpoints = [
      '/topboxes?filter[topboxable.kind]=1&limit=50',
      '/readings/realtime?duration=15&limit=10&page=1',
      '/reviews?filter[status]=2&include=creator,book&limit=4&page=1&sort=-id'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\nFetching ${endpoint}...`);
        const response = await makeApiRequest(endpoint);
        console.log(`Successfully fetched ${endpoint}`);
        console.log(`Response preview:`, JSON.stringify(response).slice(0, 200) + '...');
      } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
      }
    }

  } catch (error) {
    console.error('Error during crawling:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the crawler
console.log('Starting crawler process...');
crawlWithPuppeteer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 