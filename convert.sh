#!/bin/bash


for i in *.mp4 ; do
    ffmpeg -i "$i" -b 1500k -vcodec libvpx -acodec libvorbis -ab 160000 -f webm -g 25 -cpu-used 5 -threads 8 "low/${i%%.mp4}.webm"
    sleep 1
    ffmpeg -i "$i" -b 1500k -vcodec libtheora -acodec libvorbis -ab 160000 -g 25 -cpu-used 5 -threads 8 "low/${i%%.mp4}.ogg"
    sleep 1
    ffmpeg -i "$i" -b 3000k -vcodec libx264 -preset slow -profile:v baseline -strict -2 -g 25 -cpu-used 5 -threads 8 "low/${i%%.mp4}.mp4"
done