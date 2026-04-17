export default async function handler(req, res) {
  const STEAM_KEY = process.env.STEAM_API_KEY;
  const STEAM_ID  = "76561198021482552";
  const APP_ID    = "427520"; // Satisfactory

  if (!STEAM_KEY) {
    return res.status(500).json({ error: "Steam API key not configured." });
  }

  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${APP_ID}&key=${STEAM_KEY}&steamid=${STEAM_ID}&l=en`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.playerstats?.success) {
      return res.status(502).json({ error: "Steam API returned an error.", detail: data });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data.playerstats.achievements);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach Steam API.", detail: err.message });
  }
}
