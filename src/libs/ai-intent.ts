import { AIIntent } from "../types/ai";
import { openai } from "./openai";

const SYSTEM_PROMPT = `
Kamu adalah parser intent.
Ubah pertanyaan user menjadi JSON.

ATURAN:
- Output HARUS JSON valid
- Jangan menambahkan teks lain
- Entity: MUMI, CABERAWIT, KEGIATAN
- Action: COUNT, LIST
- Filter: daerah, desa, kelompok

Contoh:
User: jumlah mumi desa tataan
Output:
{
  "action": "COUNT",
  "entity": "MUMI",
  "filters": { "desa": "Tataan" }
}
`;

export async function parseIntent(question: string): Promise<AIIntent> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: question },
    ],
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("AI response empty");
  }

  return JSON.parse(content) as AIIntent;
}
