# 🕹️ Tariff Tycoon: Trump's Trade Toss

A humorous and highly shareable mini-game where players "slap tariffs" on randomly flying imports while avoiding American-made goods. Fast-paced, memeable, and mobile-first!

## 🎮 How to Play

1. Click/tap on foreign imports to slap tariffs on them (+100 points)
2. Avoid slapping tariffs on American-made goods (-500 points)
3. Score as many America First Points™ as possible in 30 seconds
4. Share your score on X (Twitter) to challenge friends

## 🚀 Game Features

- 30-second gameplay
- Flying items (imports and US-made goods)
- Tap/click mechanic
- Score tracking
- Share functionality
- Responsive design for mobile and desktop
- 🏆 **Global leaderboard** - compete for the top spot!

## 👾 Items Guide

### Imports (Slap these for +100 points)
- Country flags: 🇨🇳 🇯🇵 🇰🇷 🇲🇽 🇩🇪 🇮🇹 🇫🇷 🇮🇳 🇷🇺 🇧🇷
- Products: 🐼 🎧 🚗 📱 💻 👟 👕 🧸 🚲 ⌚ 📺 🍜 🍵 🍚

### American Goods (Avoid these or lose 500 points)
- 🇺🇸 🍔 🗽 🦅 🎸 🧢 🌭 🏈 🥧 🍕 🚀 🚜

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase (for leaderboard functionality)

## 🚀 Running the Game

1. Open `index.html` in your web browser to play!
2. To enable the leaderboard functionality:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Create a `players` table with columns:
     - `id` (uuid, primary key)
     - `display_name` (text)
     - `email` (text)
     - `score` (integer)
     - `created_at` (timestamp with time zone)
   - Update the `SUPABASE_URL` and `SUPABASE_KEY` values in `script.js` with your project details

## 🏆 Leaderboard

- The game features a global leaderboard showing the top 3 players
- Your high score is saved and only gets updated when you beat it
- Your name and email are stored once in localStorage so you don't need to enter them again

## 🎯 Challenge

Can you beat the high score? Share your results with #TariffTycoon and see who can be the ultimate Tariff Tycoon! 
