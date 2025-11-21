#!/bin/bash
# This script converts all JPEG, JPG, and PNG images in the 'images' directory to the WEBP format.

# Ensure the 'cwebp' command-line tool is available.
if ! [ -x "$(command -v cwebp)" ]; then
  echo 'Error: cwebp is not installed. Please install the webp package.' >&2
  exit 1
fi

# Find and convert all targeted image files.
find images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPG" -o -name "*.png" \) -print0 | while IFS= read -r -d $'\0' file; do
    # Construct the output filename with the .webp extension.
    output_file="${file%.*}.webp"
    
    # Convert the image to WEBP format, with a quality setting of 80.
    cwebp -q 80 "$file" -o "$output_file"
    
    # Check if the conversion was successful before deleting the original file.
    if [ $? -eq 0 ]; then
        echo "Converted: $file to $output_file"
        rm "$file"
    else
        echo "Error converting: $file"
    fi
done

echo "Image conversion complete."
