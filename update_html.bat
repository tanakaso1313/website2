@echo off
setlocal enabledelayedexpansion

set "files_to_update=bio.html index.html let-a-colored-paper-swim-in-clouds.html liminal-lamp.html liminal-objects.html lti.html memento.html ori.html shop.html transfer.html vnsh.html vnsh_shop.html"

for %%f in (%files_to_update%) do (
    echo "Updating %%f"
    (
        for /f "delims=" %%l in ('type "%%f"') do (
            set "line=%%l"
            set "line=!line:.jpg=.webp!"
            set "line=!line:.jpeg=.webp!"
            set "line=!line:.JPG=.webp!"
            set "line=!line:.png=.webp!"
            echo !line!
        )
    ) > "%%f.tmp"
    move /y "%%f.tmp" "%%f" > nul
)

echo "HTML update complete."
