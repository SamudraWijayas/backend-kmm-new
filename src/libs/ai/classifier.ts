import { AiQueryType } from "../../types/ai";
import { openai } from "../openai";

const PROMPT = `
Tentukan apakah pertanyaan bisa dijawab dengan database terstruktur.

Kategori:
- DATABASE → hitung, list, filter data
- ANALYTICAL → perlu perhitungan / definisi tambahan
- OPINION → opini / sebab / alasan
- UNKNOWN → tidak jelas

Jawab HANYA JSON:
{ "type": "DATABASE | ANALYTICAL | OPINION | UNKNOWN" }

Contoh:
"jumlah mumi desa tataan" → DATABASE
"kenapa mumi berkurang" → OPINION
"siapa mumi paling rajin" → ANALYTICAL
`;

export async function classifyQuestion(
  question: string
): Promise<AiQueryType> {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: question },
    ],
  });

  return JSON.parse(res.choices[0].message.content!).type;
}
