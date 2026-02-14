import os
import zipfile

# Directories to exclude
IGNORED_DIRS = {
    '.git', 
    'node_modules', 
    'dist', 
    '.firebase', 
    '.agent', 
    '.agent_backup', 
    'coverage', 
    '.husky', 
    'build', 
    '.idea', 
    '.vscode',
    '__pycache__'
}

# Files to exclude (you can add specific large files or secrets here if needed)
IGNORED_FILES = {
    '.DS_Store', 
    'Thumbs.db',
    'datingapp_full_project.zip' # exclude self
}

def zip_directory(directory_path, output_filename):
    print(f"Zipping contents of {directory_path} to {output_filename}...")
    
    file_count = 0
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(directory_path):
            # Modify dirs in-place to prune traversal - crucial for ignoring node_modules content
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
            
            for file in files:
                if file in IGNORED_FILES or file.endswith('.zip'):
                     continue
                
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, directory_path)
                
                try:
                    zipf.write(full_path, arcname=relative_path)
                    file_count += 1
                except Exception as e:
                    print(f"Skipping {relative_path}: {e}")

    print(f"Successfully zipped {file_count} files into {output_filename}")

if __name__ == "__main__":
    # Zip current directory where script is run
    zip_directory(".", "datingapp_full_project.zip")
