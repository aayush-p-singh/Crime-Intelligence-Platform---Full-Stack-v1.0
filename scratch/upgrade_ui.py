import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Premium background replacements
    content = re.sub(r'bg-\[#F7F7F7\]', 'glass-panel', content)
    content = re.sub(r'bg-\[#FAFAFA\]', 'bg-white/80 backdrop-blur-md', content)
    content = re.sub(r'bg-white border border-\[#E9E9E9\]', 'premium-card', content)
    content = re.sub(r'bg-white border border-\[#E8E8E8\]', 'premium-card', content)
    
    # Shadows
    content = re.sub(r'shadow-2xs', 'shadow-sm', content)
    content = re.sub(r'shadow-\[0_1px_3px_rgba\(0,0,0,0\.02\)\]', 'shadow-sm', content)
    
    # Cards
    content = re.sub(r'intel-card', 'premium-card', content)
    
    # Typography
    content = re.sub(r'text-\[#111111\]', 'text-[#111]', content)
    content = re.sub(r'text-\[#444444\]', 'text-[#555]', content)
    content = re.sub(r'text-\[#666666\]', 'text-[#666]', content)
    content = re.sub(r'text-\[#888888\]', 'text-[#888]', content)
    content = re.sub(r'text-3xl md:text-5xl lg:text-6xl', 'text-4xl md:text-6xl lg:text-7xl', content)
    
    # Buttons
    content = re.sub(r'btn-mechanical', 'btn-premium-glass hover-lift', content)

    # Rounded
    content = re.sub(r'rounded-xl', 'rounded-2xl', content)

    # App route enter (remove for framer motion if preferred, or keep)
    # content = re.sub(r'app-route-enter', '', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    base_dir = r"C:\IILM UNIVERSITY DATA\crime-intel-full-stack\crime-intelligence-ui\src"
    
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')) and file not in ['AppShell.tsx', 'home.tsx', 'cio.tsx', 'state-comparison.tsx', 'india-map.tsx', 'ArchitecturalBackground.tsx']:
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
