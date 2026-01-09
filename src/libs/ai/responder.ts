export function buildAnswer(
  intent: any,
  result: any
): string {
  if (intent.action === "COUNT") {
    return `Jumlah ${intent.entity.toLowerCase()} adalah ${result}.`;
  }

  if (intent.action === "LIST") {
    return `Ditemukan ${result.length} data.`;
  }

  return "Data berhasil diproses.";
}
