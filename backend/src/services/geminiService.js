import dotenv from "dotenv";

dotenv.config();

/**
 * Natural language translation using Google Gemini API
 */
export async function translateWithGemini(text, targetListeningLanguage, spokenLanguageHint = "Auto") {
  if (!text || text.trim().length === 0) return "";

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length <= 5) {
    console.error("[Gemini] Error: GEMINI_API_KEY is missing or invalid in backend .env");
    return "";
  }

  console.log(`[Translation] Target: ${targetListeningLanguage}`);

  const prompt = `You are LinguaLive AI, a real-time speech translation engine.
Translate the following spoken sentence into fluent, natural conversational ${targetListeningLanguage}.
The spoken speech was detected as ${spokenLanguageHint}.
Do NOT translate word-by-word; produce natural, spoken-style ${targetListeningLanguage} suitable for Text-to-Speech voice synthesis.
Return ONLY the final translated sentence, without any explanations, prefixes, markdown, or quotation marks.

Spoken Speech: "${text}"`;

  const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (translated && translated.trim().length > 0) {
          const cleanTranslation = translated.trim().replace(/^["']|["']$/g, "");
          console.log(`[Translation] Result: ${cleanTranslation}`);
          return cleanTranslation;
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`[Gemini API Warning (${model})]: ${response.status} ${response.statusText} ${errText}`);
      }
    } catch (err) {
      console.error(`[Gemini Translation Exception (${model})]:`, err?.message || err);
    }
  }

  return "";
}
