import dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";

dotenv.config();

/**
 * Text-to-Speech audio generation using official ElevenLabs Node.js SDK
 */
export async function generateElevenLabsVoice(text, targetListeningLanguage) {
  if (!text || text.trim().length === 0) {
    return { audioBase64: "", mimeType: "audio/mp3" };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey || apiKey.trim().length <= 5) {
    console.error("[ElevenLabs] Error: ELEVENLABS_API_KEY is missing or invalid in backend .env");
    return { audioBase64: "", mimeType: "audio/mp3" };
  }

  console.log(`[TTS] Generating ${targetListeningLanguage} audio...`);

  const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George (Premade Multilingual voice compatible with Free & Paid API tiers)
  const modelId = "eleven_multilingual_v2";

  try {
    const client = new ElevenLabsClient({ apiKey: apiKey.trim() });
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length > 0) {
      console.log(`[TTS] Audio generated (${Math.round(buffer.length / 1024)}KB)`);
      const audioBase64 = buffer.toString("base64");
      return { audioBase64, mimeType: "audio/mp3" };
    }
  } catch (err) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("401") || errMsg.includes("unauthorized") || errMsg.includes("missing_permissions")) {
      console.error("[ElevenLabs Error]: 401 Unauthorized — The API key in .env is missing 'text_to_speech' permission.");
    } else {
      console.error("[ElevenLabs Exception]:", errMsg);
    }
  }

  return { audioBase64: "", mimeType: "audio/mp3" };
}
