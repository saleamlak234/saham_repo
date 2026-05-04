import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Video, Eye, Users, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';

interface VideoItem {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  rewardAmount: number;
  isActive: boolean;
  totalViews: number;
  todayViewers: number;
  uniqueViewers: number;
  totalRewardsPaid: number;
  createdAt: string;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('20');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get('/video-rewards/admin/all');
      setVideos(res.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) { setError('Please select a video file'); return; }
    if (!title.trim()) { setError('Title is required'); return; }

    setError('');
    setUploading(true);

    const fd = new FormData();
    fd.append('video', videoFile);
    fd.append('title', title);
    fd.append('description', description);
    fd.append('rewardAmount', rewardAmount);

    try {
      await axios.post('/video-rewards/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Video uploaded successfully!');
      setShowUploadForm(false);
      setTitle(''); setDescription(''); setRewardAmount('20'); setVideoFile(null);
      fetchVideos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleVideo = async (videoId: string) => {
    try {
      await axios.put(`/video-rewards/admin/toggle/${videoId}`);
      fetchVideos();
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-b-2 border-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
            <p className="text-sm text-gray-500 mt-1">Upload videos for users to watch and earn rewards</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin" className="text-sm text-primary-600 hover:text-primary-700">← Dashboard</Link>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Upload Video
            </button>
          </div>
        </div>

        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Video</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Video title" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reward Amount (birr)</label>
                  <input
                    type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)}
                    min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows={2} placeholder="Optional description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video File *</label>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition">
                  <input type="file" className="hidden" accept="video/mp4,video/webm,video/mov"
                    onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                  {videoFile ? (
                    <p className="text-sm text-green-700 font-medium">✓ {videoFile.name}</p>
                  ) : (
                    <div>
                      <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to select video (MP4, WebM, MOV)</p>
                      <p className="text-xs text-gray-400 mt-0.5">Max 500MB</p>
                    </div>
                  )}
                </label>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={uploading}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
                <button type="button" onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos List */}
        <div className="space-y-4">
          {videos.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No videos uploaded yet</p>
            </div>
          ) : (
            videos.map(video => (
              <div key={video._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        video.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {video.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {video.description && <p className="text-sm text-gray-500 truncate mb-2">{video.description}</p>}
                    <p className="text-xs text-gray-400">{new Date(video.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => toggleVideo(video._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                    {video.isActive
                      ? <ToggleRight className="w-6 h-6 text-green-600" />
                      : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Eye className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-blue-700">{video.totalViews}</p>
                    <p className="text-xs text-gray-500">Total Views</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-green-500 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-green-700">{video.uniqueViewers}</p>
                    <p className="text-xs text-gray-500">Unique Viewers</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-amber-700">{video.todayViewers}</p>
                    <p className="text-xs text-gray-500">Today's Viewers</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-0.5" />
                    <p className="text-lg font-bold text-green-700">{(video.totalRewardsPaid || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Paid (birr)</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
