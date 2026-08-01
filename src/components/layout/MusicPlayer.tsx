// FitSync Component: MusicPlayer
// Implements persistent workout beats player with play, pause, resume, stop, next, prev, volume, seek, shuffle, repeat, mini layout, and offline synth beats generator

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

const PLAYLIST: Track[] = [
  {
    id: 'track-synth',
    title: 'AI Gym Synth Beats',
    artist: 'FitSync Generator',
    url: 'synth',
    duration: 'Infinite'
  },
  {
    id: 'track-1',
    title: 'Energy Workout Pulse',
    artist: 'FitSync Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12'
  },
  {
    id: 'track-2',
    title: 'Gym Motivation Hyper',
    artist: 'FitSync Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05'
  },
  {
    id: 'track-3',
    title: 'Cardio Core Rhythm',
    artist: 'FitSync Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:44'
  }
];

export const MusicPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Synth audio engine references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  const track = PLAYLIST[currentTrackIndex];

  // Synth Beats Player Engine (130 BPM Kick & Hi-hat loop)
  const startSynthEngine = () => {
    if (synthIntervalRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const tempo = 130;
      const interval = 60 / tempo;
      let nextBeatTime = ctx.currentTime;
      let step = 0;

      const scheduler = () => {
        while (nextBeatTime < ctx.currentTime + 0.1) {
          playSynthBeat(ctx, nextBeatTime, step);
          nextBeatTime += interval;
          step = (step + 1) % 4;
        }
        // Advance current play head time manually for synth Infinite track
        setCurrentTime(prev => prev + 0.05);
      };

      setDuration(3600); // Set dummy 1 hour length
      synthIntervalRef.current = window.setInterval(scheduler, 50);
    } catch (e) {
      console.error('Failed to start synth audio context:', e);
    }
  };

  const playSynthBeat = (ctx: AudioContext, time: number, step: number) => {
    // 1. Synth Kick Drum on every beat
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);

    kickOsc.frequency.setValueAtTime(130, time);
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.25);

    kickGain.gain.setValueAtTime(isMuted ? 0 : 0.6 * volume, time);
    kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    kickOsc.start(time);
    kickOsc.stop(time + 0.25);

    // 2. Off-beat Synth Hi-hat ticks
    if (step === 1 || step === 3) {
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'triangle';
      hatOsc.connect(hatGain);
      hatGain.connect(ctx.destination);

      hatOsc.frequency.setValueAtTime(9000, time);

      hatGain.gain.setValueAtTime(isMuted ? 0 : 0.12 * volume, time);
      hatGain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

      hatOsc.start(time);
      hatOsc.stop(time + 0.04);
    }
  };

  const stopSynthEngine = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Track Changes
  useEffect(() => {
    stopSynthEngine();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentTime(0);

    if (track.url === 'synth') {
      setDuration(3600);
      if (isPlaying) {
        startSynthEngine();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.load();
        if (isPlaying) {
          setIsLoading(true);
          audioRef.current.play()
            .then(() => setIsLoading(false))
            .catch(() => {
              setIsPlaying(false);
              setIsLoading(false);
            });
        }
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      if (track.url === 'synth') {
        stopSynthEngine();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);
      if (track.url === 'synth') {
        startSynthEngine();
      } else if (audioRef.current) {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => setIsLoading(false))
          .catch((err) => {
            console.error('Audio play failed:', err);
            setIsLoading(false);
            // Fallback: If network MP3 error, fallback to synth generator track!
            toast.error('Network track failed. Launching Synth Beats fallback.');
            setCurrentTrackIndex(0);
          });
      }
    }
  };

  const handleStop = () => {
    stopSynthEngine();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (track.url !== 'synth' && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (track.url !== 'synth' && audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (track.url !== 'synth' && audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleNext = () => {
    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * PLAYLIST.length);
      setCurrentTrackIndex(randIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    }
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (track.url === 'synth') {
        // Continue synth loop
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      handleNext();
    }
  };

  const handleAudioError = () => {
    setIsLoading(false);
    toast.error('Failed to load track. Autoplaying synth fallback.');
    setCurrentTrackIndex(0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 transition-all duration-300">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-brand-500/30 text-brand-400 shadow-[0_0_15px_rgba(57,255,20,0.25)] transition-all duration-300 hover:scale-110 hover:border-brand-500 hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] cursor-pointer"
        >
          <span className={`material-symbols-outlined text-2xl font-bold ${isPlaying ? 'animate-spin [animation-duration:4s]' : ''}`}>music_note</span>
        </button>
      )}

      {/* Expanded Player Panel */}
      {isOpen && (
        <div 
          className={`rounded-2xl bg-slate-950/95 border border-brand-500/25 p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 ${
            isMini ? 'w-64 p-3' : 'w-80'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3 select-none">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-brand-400 text-sm ${isPlaying ? 'animate-bounce' : ''}`}>graphic_eq</span>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">FITSYNC PLAYER</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMini(!isMini)} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isMini ? "Expand View" : "Minimize View"}
              >
                <span className="material-symbols-outlined text-base">
                  {isMini ? 'expand_more' : 'expand_less'}
                </span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Hide Player"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Compact Mini view */}
          {isMini ? (
            <div className="space-y-2">
              <div className="text-left select-none bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                <div className="truncate flex-1">
                  <h4 className="text-xs font-black text-white truncate">{track.title}</h4>
                  <p className="text-[9px] text-slate-400 truncate">{track.artist}</p>
                </div>
                <button
                  onClick={togglePlay}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-400 text-slate-950 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm font-black">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            // Full View
            <>
              {/* Album Art & Track Info */}
              <div className="flex items-center gap-4 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-left">
                <div className="relative h-12 w-12 rounded-lg bg-brand-950/40 border border-brand-500/20 flex items-center justify-center overflow-hidden">
                  <span className={`material-symbols-outlined text-brand-400 text-2xl ${isPlaying ? 'animate-pulse' : ''}`}>album</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-black text-white truncate">{track.title}</h4>
                  <p className="text-xs text-slate-400 truncate font-semibold">{track.artist}</p>
                </div>
                {isLoading && (
                  <div className="flex items-center justify-center h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Progress Slider */}
              <div className="mb-4 select-none">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand-400 bg-slate-800"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <span>{track.url === 'synth' ? '∞' : formatTime(duration)}</span>
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center gap-4 mb-4 select-none">
                {/* Shuffle */}
                <button 
                  onClick={() => {
                    setIsShuffle(!isShuffle);
                    toast.success(isShuffle ? 'Shuffle disabled' : 'Shuffle enabled');
                  }} 
                  className={`transition-colors cursor-pointer flex items-center ${isShuffle ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Shuffle Playlist"
                >
                  <span className="material-symbols-outlined text-lg">shuffle</span>
                </button>

                {/* Prev */}
                <button onClick={handlePrev} className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer flex items-center">
                  <span className="material-symbols-outlined text-2xl font-bold">skip_previous</span>
                </button>

                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-400 text-slate-950 shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-transform hover:scale-105 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-2xl font-black">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Next */}
                <button onClick={handleNext} className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer flex items-center">
                  <span className="material-symbols-outlined text-2xl font-bold">skip_next</span>
                </button>

                {/* Repeat */}
                <button 
                  onClick={() => {
                    setIsRepeat(!isRepeat);
                    toast.success(isRepeat ? 'Repeat disabled' : 'Repeat enabled');
                  }} 
                  className={`transition-colors cursor-pointer flex items-center ${isRepeat ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Repeat Track"
                >
                  <span className="material-symbols-outlined text-lg">repeat</span>
                </button>

                {/* Stop */}
                <button 
                  onClick={handleStop} 
                  className="text-slate-500 hover:text-red-500 transition-colors cursor-pointer flex items-center"
                  title="Stop Playback"
                >
                  <span className="material-symbols-outlined text-lg">stop</span>
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3 border-t border-slate-900 pt-3 select-none">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer flex items-center"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  <span className="material-symbols-outlined text-base">
                    {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                  </span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-brand-400 bg-slate-800"
                />
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
