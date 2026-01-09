import { AIIntent } from "../../types/ai";
import { openai } from "../openai";

const PROMPT = `
Ubah pertanyaan user menjadi intent database.

ATURAN:
- Output JSON SAJA
- Jangan jelaskan
- Entity: MUMI, CABERAWIT, KEGIATAN
- Action: COUNT, LIST
- Filter opsional: daerah, desa, kelompok, jenjang

Contoh:
User: jumlah mumi desa tataan
Output:
{
  "action": "COUNT",
  "entity": "MUMI",
  "filters": { "desa": "Tataan" }
}
`;

export async function extractIntent(
  question: string
): Promise<AIIntent> {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: question },
    ],
  });

  return JSON.parse(res.choices[0].message.content!);
}
