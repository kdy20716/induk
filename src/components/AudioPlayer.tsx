'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtxClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Warm gallery acoustic filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.connect(masterGain);

    // Contemplative museum ambient drone chord (Pure Sine waves, subtle harmonics)
    const freqs = [65.41, 98.0, 130.81, 164.81]; // C2, G2, C3, E3 Major Triad with deep warmth

    const oscs: OscillatorNode[] = [];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.035 / (idx + 1), ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscs.push(osc);
    });

    oscillatorsRef.current = oscs;
  };

  const startAudio = () => {
    initAudio();
    if (audioCtxRef.current && gainNodeRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      gainNodeRef.current.gain.setTargetAtTime(0.06, audioCtxRef.current.currentTime, 2.0);
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 1.0);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  return (
    <button
      onClick={togglePlay}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-[11px] font-mono tracking-widest text-zinc-400 hover:text-white hover:border-white/30 transition-all"
      title="미술관 앰비언트 음향 토글"
    >
      {isPlaying ? (
        <>
          <Volume2 className="h-3 w-3 text-[#c5a880]" />
          <span>GALLERY SOUND ON</span>
        </>
      ) : (
        <>
          <VolumeX className="h-3 w-3 text-zinc-600" />
          <span>SOUND OFF</span>
        </>
      )}
    </button>
  );
}
