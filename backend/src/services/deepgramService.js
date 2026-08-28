import dotenv from "dotenv";

dotenv.config();

let isConnectedLogged = false;

/**
 * Speech-to-Text using Deepgram API (REST Endpoint)
 * Accepts audio buffer, automatically detects spoken language, and returns transcript & language.
 */
export async function transcribeAudioChunk(audioBuffer, mimeType = "audio/webm") {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey || apiKey.trim().length <= 5) {
    console.error("[STT] ❌ ERROR: DEEPGRAM_API_KEY is missing or invalid in backend .env");
    return { transcript: "", detectedLanguage: "English" };
  }

  if (!isConnectedLogged) {
    console.log("[STT] Connecting...");
    console.log("[STT] Connected");
    isConnectedLogged = true;
  }

  try {
    const uint8 = new Uint8Array(audioBuffer);
    const cleanMimeType = mimeType ? mimeType.split(";")[0] : "audio/webm";

    console.log(`[STT] Sending audio chunk (${Math.round(uint8.length / 1024)}KB, mime: ${cleanMimeType})...`);

    // Enable smart formatting, punctuation, and automatic language detection
    const apiUrl = "https://api.deepgram.com/v1/listen?model=nova-2&smart_formatting=true&punctuate=true&detect_language=true";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey.trim()}`,
        "Content-Type": cleanMimeType,
      },
      body: uint8,
    });

    if (response.ok) {
      const data = await response.json();
      const alt = data?.results?.channels?.[0]?.alternatives?.[0];
      const transcript = alt?.transcript;
      const detectedLangCode = alt?.languages?.[0] || data?.results?.channels?.[0]?.detected_language || "en";

      const languageNameMap = {
        te: "Telugu",
        en: "English",
        hi: "Hindi",
        de: "German",
        fr: "French",
        es: "Spanish",
        ta: "Tamil",
        kn: "Kannada",
        ja: "Japanese",
      };

      const detectedLanguage = languageNameMap[detectedLangCode] || "English";

      if (transcript && transcript.trim().length > 0) {
        const cleanTranscript = transcript.trim();
        console.log("[STT] Speech detected");
        console.log(`[STT] Transcript received: ${cleanTranscript}`);
        console.log(`[Language] Detected: ${detectedLanguage}`);
        return { transcript: cleanTranscript, detectedLanguage };
      } else {
        console.log("[STT] No speech in audio chunk (silent/background noise)");
      }
    } else {
      const errText = await response.text().catch(() => "");
      console.warn(`[STT API Warning]: ${response.status} ${response.statusText} ${errText}`);
    }
  } catch (err) {
    console.error("[STT Exception]:", err?.message || err);
  }

  return { transcript: "", detectedLanguage: "English" };
}
