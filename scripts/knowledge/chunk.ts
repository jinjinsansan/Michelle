export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export interface TextChunk {
  content: string;
  index: number;
}

export function chunkText(
  text: string,
  { chunkSize = 1000, overlap = 200 }: ChunkOptions = {},
): TextChunk[] {
  if (chunkSize <= overlap) {
    throw new Error("chunkSize must be greater than overlap");
  }

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const step = chunkSize - overlap;
  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const slice = normalized.slice(start, end).trim();
    if (slice) {
      chunks.push({ content: slice, index });
      index += 1;
    }
    if (end === normalized.length) {
      break;
    }
    start += step;
  }

  return chunks;
}
