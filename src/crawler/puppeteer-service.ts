import { EventEmitter } from "events"
import type { Browser, Page } from "puppeteer"
import puppeteer from "puppeteer"

class PuppeteerService extends EventEmitter {
  private browser: Browser | null = null
  private page: Page | null = null
  private isRunning: boolean = false

  async initialize() {
    if (this.isRunning) return;

    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set headers to mimic browser
      await this.page.setExtraHTTPHeaders({
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      // Enable request interception
      await this.page.setRequestInterception(true);

      // Listen for requests
      this.page.on('request', (request) => {
        const url = request.url();
        if (url.includes('api')) {
          this.emit('request', {
            url,
            method: request.method(),
            headers: request.headers()
          });
        }
        request.continue();
      });

      // Listen for responses
      this.page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('api')) {
          try {
            const responseData = await response.json();
            this.emit('response', {
              url,
              status: response.status(),
              data: responseData
            });
          } catch (error) {
            console.error('Error parsing response:', error);
          }
        }
      });

      this.isRunning = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Error initializing Puppeteer:', error);
      this.emit('error', error);
    }
  }

  async navigateToUrl(url: string) {
    if (!this.page) {
      throw new Error('Puppeteer not initialized');
    }

    try {
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      this.emit('navigated', url);
    } catch (error) {
      console.error('Error navigating to URL:', error);
      this.emit('error', error);
    }
  }

  async makeApiRequest(endpoint: string, params: Record<string, any> = {}) {
    if (!this.page) {
      throw new Error('Puppeteer not initialized');
    }

    try {
      const url = new URL(endpoint);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });

      const response = await this.page.evaluate(async (url) => {
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

      this.emit('apiResponse', {
        endpoint,
        response
      });

      return response;
    } catch (error) {
      console.error('Error making API request:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isRunning = false;
      this.emit('closed');
    }
  }
}

export const puppeteerService = new PuppeteerService(); 