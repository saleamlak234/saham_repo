import React, { useState, useEffect } from 'react';
import { Play, DollarSign } from 'lucide-react';
import axios from 'axios';

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  rewardAmount: number;
  claimedToday: boolean;
  todayViewCount: number;
}

interface VideoRewardProps {
  onRewardClaimed?: () => void;
}

export default function VideoReward({ onRewardClaimed }: VideoRewardProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
    fetchTodayEarnings();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get('/video-rewards/videos');
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayEarnings = async () => {
    try {
      const res = await axios.get('/video-rewards/today-earnings');
      setTodayTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch today earnings:', err);
    }
  };

  const claimReward = async (videoId: string) => {
    try {
      setClaiming(true);
      setError('');
      const res = await axios.post(`/video-rewards/claim/${videoId}`);
      setMessage(`+${res.data.earned} birr earned!`);
      setSelectedVideo(null);
      fetchVideos();
      fetchTodayEarnings();
      onRewardClaimed?.();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error claiming reward');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-b-2 border-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Earnings Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Today's Video Earnings</p>
            <p className="text-3xl font-bold">{todayTotal.toFixed(0)} birr</p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-green-100 text-xs mt-2">Earn 20 birr per video watched. No limit on views!</p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded-xl">
          <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No videos available yet</p>
          <p className="text-xs text-gray-400 mt-1">Check back later for new videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
              {/* Thumbnail Placeholder */}
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center group cursor-pointer"
                onClick={() => setSelectedVideo(video)}>
                <Play className="w-12 h-12 text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition" />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  +{video.rewardAmount} birr
                </div>
                {video.todayViewCount > 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Watched {video.todayViewCount}×
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{video.title}</h3>
                {video.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{video.description}</p>
                )}
                <button
                  onClick={() => setSelectedVideo(video)}
                  className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Watch & Earn {video.rewardAmount} birr
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Watch Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                disabled={claiming}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >✕</button>
            </div>

            <div className="bg-gray-900 aspect-video flex items-center justify-center">
              <video
                src={selectedVideo.videoUrl}
                controls
                className="w-full h-full"
                controlsList="nodownload"
              />
            </div>

            <div className="p-5">
              {selectedVideo.description && (
                <p className="text-sm text-gray-600 mb-4">{selectedVideo.description}</p>
              )}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Reward for watching</p>
                  <p className="text-2xl font-bold text-green-600">+{selectedVideo.rewardAmount} birr</p>
                </div>
                {selectedVideo.todayViewCount > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Watched today</p>
                    <p className="text-lg font-bold text-blue-600">{selectedVideo.todayViewCount}×</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => claimReward(selectedVideo._id)}
                disabled={claiming}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {claiming ? 'Claiming...' : `Claim ${selectedVideo.rewardAmount} birr`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
