"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/components/providers/PlayerContext";

export function AudioVisualizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { audioRef, isPlaying } = usePlayer();
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const audio = audioRef.current;
        if (!canvas || !audio) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let audioContext: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let source: MediaElementAudioSourceNode | null = null;
        let dataArray: Uint8Array;

        const initAudio = () => {
            if (analyserRef.current) return; // Already initialized

            audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            analyserRef.current = analyser;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        };

        const draw = () => {
            if (!analyserRef.current || !ctx) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (analyserRef.current as any).getByteFrequencyData(dataArray as any);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

                // Gradient from cyan to purple
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, "#00e5ff");
                gradient.addColorStop(0.5, "#00b8cc");
                gradient.addColorStop(1, "#7b2cbf");

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

                // Reflection
                ctx.fillStyle = `rgba(0, 229, 255, 0.1)`;
                ctx.fillRect(x, canvas.height, barWidth - 2, barHeight * 0.3);

                x += barWidth;
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        if (isPlaying) {
            try {
                initAudio();
                draw();
            } catch (e) {
                console.log("Audio visualization not supported");
            }
        }

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, audioRef]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className="w-full h-full opacity-80"
        />
    );
}
