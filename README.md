# JewelHuntrix

This is a full-stack TypeScript application with a React frontend and an Express.js backend that helps users find valuable jewelry on Vinted.

## Features

- **Automated Vinted Scans:** The application automatically scans Vinted for new listings based on user-defined search queries.
- **AI-Powered Analysis:** It uses AI to analyze listing images and determine the likelihood of an item being valuable.
- **Telegram Notifications:** Users receive Telegram notifications for valuable findings.
- **Manual Scan:** Users can manually submit a Vinted listing URL for immediate AI analysis.

## Scheduler & Memory-Safe Mode

The application uses a scheduler to run automated scans at regular intervals. The scheduler is configured to run every 15 minutes and checks for new listings based on the user's search queries. To ensure the application runs smoothly and doesn't exceed memory limits, it includes the following features:

- **Memory Limit:** The production `start` script is configured with a `--max-old-space-size` flag to limit the Node.js process's memory usage.
- **Memory Logging:** The application logs memory usage before and after each scan to monitor performance.
- **Efficient Scraping:** The Vinted scraper is optimized to only fetch the necessary data, and it aborts unnecessary network requests to save bandwidth and memory.
- **Garbage Collection:** The application exposes the garbage collector and runs it after each scan to free up memory.
