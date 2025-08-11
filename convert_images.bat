@echo off
FOR /R images %%f IN (*.jpg, *.jpeg, *.JPG, *.png) DO (
    echo "Converting %%f"
    cwebp -q 80 "%%f" -o "%%~dpnf.webp"
    if exist "%%~dpnf.webp" (
        del "%%f"
    )
)
echo "Image conversion complete."
