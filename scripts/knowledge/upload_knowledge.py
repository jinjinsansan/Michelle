#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

# Load environment variables
env_local = Path.cwd() / ".env.local"
if env_local.exists():
    load_dotenv(env_local, override=True)
load_dotenv()

# Configuration
KNOWLEDGE_DIR = Path.cwd() / "md"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
BATCH_SIZE = 10
EMBEDDING_MODEL = "text-embedding-3-small"

# Validate environment
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY is required")
if not os.getenv("NEXT_PUBLIC_SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    raise ValueError("Supabase credentials required")

# Initialize clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    """Split text into overlapping chunks."""
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")
    
    normalized = text.replace("\r\n", "\n").strip()
    if not normalized:
        return []
    
    chunks = []
    start = 0
    index = 0
    step = chunk_size - overlap
    
    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        slice_text = normalized[start:end].strip()
        if slice_text:
            chunks.append({"content": slice_text, "index": index})
            index += 1
        if end == len(normalized):
            break
        start += step
    
    return chunks


def list_markdown_files(directory: Path):
    """Recursively find all markdown files."""
    md_files = []
    for item in directory.rglob("*.md"):
        if item.is_file():
            md_files.append(item)
    return md_files


def embed_text(text: str):
    """Generate embedding for text using OpenAI."""
    response = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    return response.data[0].embedding


def process_file(file_path: Path):
    """Process a single markdown file."""
    relative_source = str(file_path.relative_to(KNOWLEDGE_DIR))
    print(f"\n📄 Processing {relative_source}")
    
    # Read file content
    content = file_path.read_text(encoding="utf-8")
    chunks = chunk_text(content)
    
    if not chunks:
        print("  ⚠️  No content found, skipping.")
        return
    
    # Delete existing records for this source
    try:
        supabase.from_("knowledge").delete().eq("metadata->>source", relative_source).execute()
    except Exception as e:
        print(f"  ⚠️  Error deleting old records: {e}")
    
    # Process chunks in batches
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        embeddings = []
        
        # Generate embeddings for batch
        for chunk in batch:
            embedding = embed_text(chunk["content"])
            embeddings.append(embedding)
        
        # Prepare rows for insertion
        rows = []
        for idx, chunk in enumerate(batch):
            rows.append({
                "content": chunk["content"],
                "embedding": embeddings[idx],
                "metadata": {
                    "source": relative_source,
                    "chunk_index": chunk["index"]
                }
            })
        
        # Insert into database
        try:
            supabase.from_("knowledge").insert(rows).execute()
            last_chunk_idx = batch[-1]["index"]
            total = len(chunks)
            print(f"  ✅ Inserted chunks {batch[0]['index']}-{last_chunk_idx} ({min(i + BATCH_SIZE, total)}/{total})")
        except Exception as e:
            print(f"  ❌ Error inserting batch: {e}")
            raise


def main():
    """Main execution function."""
    # Check knowledge directory exists
    if not KNOWLEDGE_DIR.exists():
        raise FileNotFoundError(f"Knowledge directory not found: {KNOWLEDGE_DIR}")
    
    # Find all markdown files
    files = list_markdown_files(KNOWLEDGE_DIR)
    if not files:
        print("No markdown files found in md directory.")
        return
    
    print(f"\n🚀 Starting knowledge base upload ({len(files)} files)...\n")
    
    # Process each file
    for file_path in files:
        try:
            process_file(file_path)
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            continue
    
    print("\n✨ Knowledge base upload complete.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Failed to seed knowledge base: {e}")
        sys.exit(1)
