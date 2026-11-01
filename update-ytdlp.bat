@echo off
rem Platforms change often. Run this when downloads stop working, then restart start.bat.
python -m pip install -U "yt-dlp[default]"
python -m yt_dlp --version
pause
