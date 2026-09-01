import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import StatusPill from '../components/StatusPill';
import { useAuth } from '../context/AuthContext';

export default function ChallengeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await apiClient.get(`/challenges/${id}`);
    setData(data);
    setLoading(false);
    
    // Load messages
    try {
      const { data: messagesData } = await apiClient.get(`/challenges/${id}/messages`);
      setMessages(messagesData.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleReview(action) {
    setActionLoading(true);
    try {
      await apiClient.post(`/challenges/${id}/review`, { action, comment });
      await load();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      if (attachmentFile) {
        formData.append('file', attachmentFile);
      }
      
      await apiClient.post(`/challenges/${id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewMessage('');
      setAttachmentFile(null);
      await load();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) return <p className="text-center mt-10 text-slate-400">Loading…</p>;
  if (!data) return <p className="text-center mt-10 text-slate-400">Challenge not found.</p>;

  const { challenge, aiAnalysis, matches } = data;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 space-y-6">
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">{challenge.challenge_code}</p>
            <h1 className="text-xl font-bold text-gov-900 mt-1">{challenge.title}</h1>
          </div>
          <StatusPill status={challenge.status} />
        </div>
        <p className="text-slate-600 mt-4">{challenge.description}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <p><span className="text-slate-400">Domain:</span> {challenge.domain || '—'}</p>
          <p><span className="text-slate-400">People Affected:</span> {challenge.people_affected ?? '—'}</p>
          <p><span className="text-slate-400">Location:</span> {[challenge.village, challenge.block, challenge.district].filter(Boolean).join(', ') || '—'}</p>
          <p><span className="text-slate-400">Existing Interventions:</span> {challenge.existing_interventions || '—'}</p>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h2 className="font-semibold text-indigo-900 mb-3">AI Analysis</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>Priority: <span className="font-semibold">{aiAnalysis.priority}</span></p>
            <p>Severity Score: <span className="font-semibold">{aiAnalysis.severity_score}</span></p>
            <p>Impact Score: <span className="font-semibold">{aiAnalysis.impact_score}</span></p>
            <p>Required Skills: <span className="font-semibold">{(aiAnalysis.required_skills || []).join(', ')}</span></p>
          </div>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
          <h2 className="font-semibold text-gov-900 mb-3">Ranked University Matches</h2>
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="border border-slate-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gov-900">{m.university_name}</p>
                  <span className="text-sm font-bold text-emerald-600">{m.match_score}% Match</span>
                </div>
                <ul className="text-sm text-slate-500 mt-2 list-disc list-inside">
                  {(m.reasons || []).map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'GOVERNMENT' && challenge.status === 'PENDING_VALIDATION' && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
          <h2 className="font-semibold text-gov-900 mb-3">Review This Challenge</h2>
          <textarea
            placeholder="Optional comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3"
            rows={2}
          />
          <div className="flex gap-3">
            <button disabled={actionLoading} onClick={() => handleReview('APPROVE')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
              Approve
            </button>
            <button disabled={actionLoading} onClick={() => handleReview('REQUEST_INFO')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
              Request Information
            </button>
            <button disabled={actionLoading} onClick={() => handleReview('REJECT')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Messages Section */}
      {(challenge.status === 'INFO_REQUESTED' || (messages.length > 0 && challenge.status === 'PENDING_VALIDATION')) && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
          <h2 className="font-semibold text-gov-900 mb-4">Communication</h2>
          
          {messages.length > 0 && (
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-4 rounded-lg ${msg.sender_id === user.id ? 'bg-gov-50 ml-8' : 'bg-slate-50 mr-8'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-gov-900">
                      {msg.sender_name} ({msg.sender_role})
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{msg.message}</p>
                  {msg.attachment_url && (
                    <div className="mt-2">
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" 
                        className="text-xs text-blue-600 hover:underline">
                        📎 View Attachment
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3"
              rows={3}
            />
            <div className="flex items-center gap-3">
              {user.role === 'CITIZEN' && (
                <input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="text-sm"
                />
              )}
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                className="bg-gov-700 hover:bg-gov-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
