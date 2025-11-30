#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load environment variables
env_local = Path.cwd() / ".env.local"
if env_local.exists():
    load_dotenv(env_local, override=True)
load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = "asst_h5rrljLWogiiDUrgzz0hH17C"

if not API_KEY:
    print("❌ OPENAI_API_KEY is missing.")
    sys.exit(1)

# Read the prompt from the TypeScript file
prompt_file = Path.cwd() / "src" / "lib" / "ai" / "prompt.ts"
prompt_content = prompt_file.read_text(encoding="utf-8")

# Extract MICHELLE_PROMPT_V9 and RESPONSE_FORMAT_V9
import re
prompt_match = re.search(r'export const MICHELLE_PROMPT_V9 = `(.*?)`;\s*export const RESPONSE_FORMAT_V9', prompt_content, re.DOTALL)
format_match = re.search(r'export const RESPONSE_FORMAT_V9 = `(.*?)`;\s*export const MICHELLE_SYSTEM_PROMPT', prompt_content, re.DOTALL)

if not prompt_match or not format_match:
    print("❌ Could not extract prompts from prompt.ts")
    sys.exit(1)

instructions = prompt_match.group(1) + "\n\n" + format_match.group(1)

print(f"🔄 Updating Assistant: {ASSISTANT_ID}...")
print(f"Instructions length: {len(instructions)} chars")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2",
}

payload = {
    "instructions": instructions,
    "name": "Michelle AI (v9.0 - Michelle Psychology Brand)",
}

response = requests.post(
    f"https://api.openai.com/v1/assistants/{ASSISTANT_ID}",
    headers=headers,
    json=payload
)

if response.status_code != 200:
    print(f"❌ Failed to update assistant: {response.text}")
    sys.exit(1)

result = response.json()
print("✅ Assistant Updated Successfully!")
print(f"Name: {result['name']}")
print(f"Instructions length: {len(result['instructions'])} chars")
