# Fact-Checking Web App

This project is a Fact-Checking Web Application that ingests a PDF,
extracts factual claims, verifies them against live web data, and flags
each claim as Verified, Inaccurate, or False.

## Tech Stack
- Frontend: React (Vite) deployed on Vercel
- Backend: Python (Flask)
- Claim Extraction & Reasoning: LLM
- Live Web Search: Exa API

## How It Works
1. User uploads a PDF through the web interface
2. Backend extracts factual claims (statistics, dates, financial figures)
3. Each claim is cross-referenced against live web search results
4. Claims are classified as:
   - Verified
   - Inaccurate (outdated or mismatched data)
   - False (no reliable evidence)
