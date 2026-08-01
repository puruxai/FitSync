import React, { useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

const PLAYLIST: Track[] = [
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const formatTime = (secs: number) => {
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
        onEnded={handleNext}
      />

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-brand-500/30 text-brand-400 shadow-[0_0_15px_rgba(57,255,20,0.25)] transition-all duration-300 hover:scale-110 hover:border-brand-500 hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] cursor-pointer"
        >
          <span className="material-symbols-outlined animate-spin [animation-duration:8s] text-2xl font-bold">music_note</span>
        </button>
      )}

      {/* Expanded Player Panel */}
      {isOpen && (
        <div className="w-80 rounded-2xl bg-slate-950/95 border border-brand-500/25 p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-400 animate-bounce">graphic_eq</span>
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">FITSYNC RADIO</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Album Art / Track Info */}
          <div className="flex items-center gap-4 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative h-12 w-12 rounded-lg bg-brand-950/40 border border-brand-500/20 flex items-center justify-center overflow-hidden">
              <span className={`material-symbols-outlined text-brand-400 text-2xl ${isPlaying ? 'animate-pulse' : ''}`}>album</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
              <p className="text-xs text-slate-400 truncate">{track.artist}</p>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-brand-400 bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Media Controls */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <button onClick={handlePrev} className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-2xl font-bold">skip_previous</span>
            </button>
            <button
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-400 text-slate-950 shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-transform hover:scale-105 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl font-black">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button onClick={handleNext} className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-2xl font-bold">skip_next</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
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
        </div>
      )}
    </div>
  );
};
export default MusicPlayer;
