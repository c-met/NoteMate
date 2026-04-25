"""
HuggingFace Spaces Deployment Helper for NoteMate Backend

This script prepares the hf-space/ directory with all backend files needed
for deployment to Hugging Face Spaces.

Usage: python prepare_hf_space.py
"""
import shutil
import os

# Paths
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "backend")
HF_SPACE_DIR = os.path.join(os.path.dirname(__file__), "hf-space")

# Files/dirs to copy from backend/
ITEMS_TO_COPY = ["app", "Dockerfile", "requirements.txt", ".env.example"]

# Files/dirs to skip
SKIP = {".env", ".venv", "venv", "data", "tests", "__pycache__", ".pytest_cache"}

def main():
    print("🚀 Preparing HuggingFace Space...")
    
    # Copy each needed item
    for item in ITEMS_TO_COPY:
        src = os.path.join(BACKEND_DIR, item)
        dst = os.path.join(HF_SPACE_DIR, item)
        
        if not os.path.exists(src):
            print(f"  ⚠️  Skipping {item} (not found)")
            continue
            
        # Remove existing destination
        if os.path.exists(dst):
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)
        
        # Copy
        if os.path.isdir(src):
            shutil.copytree(src, dst, ignore=shutil.ignore_patterns(*SKIP))
            print(f"  ✅ Copied directory: {item}/")
        else:
            shutil.copy2(src, dst)
            print(f"  ✅ Copied file: {item}")
    
    # Verify README.md exists
    readme = os.path.join(HF_SPACE_DIR, "README.md")
    if os.path.exists(readme):
        print(f"  ✅ README.md already exists")
    else:
        print(f"  ❌ README.md is missing! Create it first.")
        return
    
    # Make sure .env is NOT in the folder
    env_file = os.path.join(HF_SPACE_DIR, ".env")
    if os.path.exists(env_file):
        os.remove(env_file)
        print(f"  🔒 Removed .env (use HF Secrets instead)")
    
    print()
    print("✅ HF Space is ready at: hf-space/")
    print()
    print("📁 Contents:")
    for item in sorted(os.listdir(HF_SPACE_DIR)):
        if item.startswith('.git') and item != '.gitignore':
            continue
        marker = "📂" if os.path.isdir(os.path.join(HF_SPACE_DIR, item)) else "📄"
        print(f"   {marker} {item}")
    print()
    print("=" * 50)
    print("NEXT STEPS:")
    print("=" * 50)
    print("1. Create your Space at: https://huggingface.co/new-space")
    print("   - Name: notemate-backend")
    print("   - SDK: Docker")
    print("   - Hardware: CPU Basic (Free)")
    print()
    print("2. Get an Access Token at: https://huggingface.co/settings/tokens")
    print("   - Click 'Create new token'")
    print("   - Name: notemate")  
    print("   - Type: Write")
    print("   - Copy the token")
    print()
    print("3. Clone & push (replace YOUR_USERNAME):")
    print("   cd hf-space")
    print("   git init")
    print("   git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/notemate-backend")
    print("   git add .")
    print("   git commit -m 'Initial deployment'")
    print("   git push origin main")
    print("   (Enter your HF username & access token when prompted)")
    print()
    print("4. Add Secrets in Space Settings:")
    print("   GROQ_API_KEY, OPENROUTER_API_KEY, NOMIC_API_KEY, etc.")

if __name__ == "__main__":
    main()
