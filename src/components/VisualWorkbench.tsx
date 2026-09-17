import React, { useState, useEffect, useRef } from 'react';
import { ChatCharacter, ChatMessage, MessageType } from '../types';
import { ChatMeta } from '../utils/chatCompiler';
import { parseArchiveContent, ProjectArchiveData } from '../utils/archiveHelper';
import {
  Users,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Video,
  Phone,
  Mic,
  Gift,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  Bell,
  UserCheck,
  Edit2,
  Check,
  Sparkles,
  Settings2,
  GripVertical,
  Archive,
  Upload,
  Download,
  FileText,
} from 'lucide-react';

interface VisualWorkbenchProps {
  characters: ChatCharacter[];
  onUpdateCharacters: (chars: ChatCharacter[]) => void;
  messages: ChatMessage[];
  onUpdateMessages: (msgs: ChatMessage[]) => void;
  chatMeta: ChatMeta;
  onUpdateChatMeta: (meta: ChatMeta) => void;
  onLoadPresetStory?: () => void;
  onOpenArchiveModal?: (tab?: 'export' | 'import') => void;
  onImportArchive?: (data: Partial<ProjectArchiveData>) => void;
}

const PRESET_AVATAR_COLORS = [
  '#4f7cac', // 沉稳蓝
  '#2e7d32', // 墨绿
  '#c0392b', // 赤红
  '#555555', // 深灰
  '#7b1fa2', // 紫罗兰
  '#d97706', // 琥珀橙
  '#0284c7', // 蔚蓝
  '#be185d', // 莓红
  '#0f766e', // 青碧
];

export const VisualWorkbench: React.FC<VisualWorkbenchProps> = ({
  characters,
  onUpdateCharacters,
  messages,
  onUpdateMessages,
  chatMeta,
  onUpdateChatMeta,
  onLoadPresetStory,
  onOpenArchiveModal,
  onImportArchive,
}) => {
  // Active selected character for sending
  const [activeSenderId, setActiveSenderId] = useState<string>(
    characters[0]?.id || 'me'
  );

  // Keep activeSenderId valid when characters change
  useEffect(() => {
    if (characters.length > 0 && !characters.some((c) => c.id === activeSenderId)) {
      setActiveSenderId(characters[0].id);
    }
  }, [characters, activeSenderId]);

  // Quick file drop input ref
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [workbenchDropActive, setWorkbenchDropActive] = useState(false);

  // Quick file import handler
  const handleQuickFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const res = parseArchiveContent(content);
      if (res.success && res.data) {
        if (onImportArchive) {
          onImportArchive(res.data);
        } else if (onOpenArchiveModal) {
          onOpenArchiveModal('import');
        }
      } else {
        alert(res.errorMessage || '无法识别该文件内容，请检查文件格式。');
      }
    };
    reader.readAsText(file);
  };

  // Character Modal / State
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [charFormName, setCharFormName] = useState('');
  const [charFormShort, setCharFormShort] = useState('');
  const [charFormColor, setCharFormColor] = useState(PRESET_AVATAR_COLORS[0]);
  const [charFormIsMe, setCharFormIsMe] = useState(false);
  const [charFormAvatarUrl, setCharFormAvatarUrl] = useState('');

  // Active message type tab
  const [activeTab, setActiveTab] = useState<MessageType>('text');

  // Input States for New Message
  const [textContent, setTextContent] = useState('');
  const [hasQuote, setHasQuote] = useState(false);
  const [quoteSender, setQuoteSender] = useState('');
  const [quoteText, setQuoteText] = useState('');

  // Video Call input
  const [videoCallMode, setVideoCallMode] = useState<'bubble' | 'card'>('bubble');
  const [callStatus, setCallStatus] = useState('视频通话已取消');
  const [callDuration, setCallDuration] = useState('18:42');

  // Voice Call input
  const [voiceCallStatus, setVoiceCallStatus] = useState('通话时长 05:21');

  // Voice message
  const [voiceSeconds, setVoiceSeconds] = useState('12');
  const [voiceUnread, setVoiceUnread] = useState(false);

  // Red packet
  const [packetDesc, setPacketDesc] = useState('恭喜发财，大吉大利');
  const [packetStatus, setPacketStatus] = useState('领取红包');

  // Transfer
  const [transferAmount, setTransferAmount] = useState('¥ 520.00');
  const [transferNote, setTransferNote] = useState('请查收转账');

  // Image
  const [imageDesc, setImageDesc] = useState('特策档案_现场照片.jpg');
  const [imageSize, setImageSize] = useState('1.8 MB');
  const [imageUrl, setImageUrl] = useState('');

  // Blocked message
  const [blockedContent, setBlockedContent] = useState('你在哪里？为什么不接电话？');

  // System notice
  const [systemNoticeText, setSystemNoticeText] = useState('你拍了拍“陆顾问”');

  // Time stamp
  const [timeText, setTimeText] = useState('今天 01:24');

  // Editing existing message
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);

  // Drag and Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Clear confirmation state (inline, iframe-safe)
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handlers for Characters
  const openAddChar = () => {
    setEditingCharId(null);
    setCharFormName('');
    setCharFormShort('');
    setCharFormColor(PRESET_AVATAR_COLORS[characters.length % PRESET_AVATAR_COLORS.length]);
    setCharFormIsMe(false);
    setCharFormAvatarUrl('');
    setIsCharModalOpen(true);
  };

  const openEditChar = (c: ChatCharacter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCharId(c.id);
    setCharFormName(c.name);
    setCharFormShort(c.shortName);
    setCharFormColor(c.color);
    setCharFormIsMe(c.isMe);
    setCharFormAvatarUrl(c.avatarUrl || '');
    setIsCharModalOpen(true);
  };

  const handleSaveChar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charFormName.trim()) return;
    const short = charFormShort.trim() || charFormName.trim().slice(-1);

    if (editingCharId) {
      onUpdateCharacters(
        characters.map((c) =>
          c.id === editingCharId
            ? {
                ...c,
                name: charFormName.trim(),
                shortName: short,
                color: charFormColor,
                isMe: charFormIsMe,
                avatarUrl: charFormAvatarUrl.trim() || undefined,
              }
            : c
        )
      );
    } else {
      const newChar: ChatCharacter = {
        id: 'char_' + Date.now(),
        name: charFormName.trim(),
        shortName: short,
        color: charFormColor,
        isMe: charFormIsMe,
        avatarUrl: charFormAvatarUrl.trim() || undefined,
      };
      onUpdateCharacters([...characters, newChar]);
      setActiveSenderId(newChar.id);
    }
    setIsCharModalOpen(false);
  };

  const handleDeleteChar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (characters.length <= 1) {
      return;
    }
    const filtered = characters.filter((c) => c.id !== id);
    onUpdateCharacters(filtered);
    if (activeSenderId === id) {
      setActiveSenderId(filtered[0].id);
    }
  };

  // Add or update message
  const handleCommitMessage = () => {
    const activeSender = characters.find((c) => c.id === activeSenderId) || characters[0];
    const newMsg: ChatMessage = {
      id: editingMsgId || 'msg_' + Date.now(),
      type: activeTab,
      senderId: activeSender.id,
    };

    switch (activeTab) {
      case 'text':
        if (!textContent.trim()) return;
        newMsg.content = textContent;
        if (hasQuote && quoteText.trim()) {
          newMsg.quoteSender = quoteSender.trim() || '某人';
          newMsg.quoteText = quoteText.trim();
        }
        break;

      case 'video_call':
        if (videoCallMode === 'card') {
          newMsg.type = 'call_screen';
          newMsg.callStatus = callStatus.includes('●') ? callStatus : `● ${callStatus}`;
          newMsg.callDuration = callDuration || '18:42';
        } else {
          newMsg.type = 'video_call';
          newMsg.callStatus = callStatus;
        }
        break;

      case 'voice_call':
        newMsg.callStatus = voiceCallStatus;
        break;

      case 'voice':
        newMsg.duration = `${voiceSeconds}''`;
        newMsg.isUnread = voiceUnread;
        break;

      case 'redpacket':
        newMsg.packetDesc = packetDesc;
        newMsg.packetStatus = packetStatus;
        break;

      case 'transfer':
        newMsg.amount = transferAmount;
        newMsg.content = transferNote;
        break;

      case 'image':
        newMsg.mediaDesc = imageDesc;
        newMsg.mediaSize = imageSize;
        newMsg.mediaUrl = imageUrl.trim() || undefined;
        break;

      case 'blocked':
        if (!blockedContent.trim()) return;
        newMsg.content = blockedContent;
        break;

      case 'friend_verify':
        // No extra params needed
        break;

      case 'time':
        newMsg.content = timeText;
        break;

      case 'system_notice':
        newMsg.systemText = systemNoticeText;
        break;
    }

    if (editingMsgId) {
      onUpdateMessages(messages.map((m) => (m.id === editingMsgId ? newMsg : m)));
      setEditingMsgId(null);
    } else {
      onUpdateMessages([...messages, newMsg]);
    }

    // Reset some transient fields
    if (activeTab === 'text') {
      setTextContent('');
      setHasQuote(false);
      setQuoteText('');
    }
  };

  // Message sequence operations
  const moveMessage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= messages.length) return;
    const copy = [...messages];
    const item = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = item;
    onUpdateMessages(copy);
  };

  const deleteMessage = (id: string) => {
    if (editingMsgId === id) {
      setEditingMsgId(null);
    }
    onUpdateMessages(messages.filter((m) => m.id !== id));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...messages];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdateMessages(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleClearAllMessages = () => {
    onUpdateMessages([]);
    setEditingMsgId(null);
    setShowClearConfirm(false);
  };

  const startEditMessage = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setActiveSenderId(msg.senderId);
    if (msg.type === 'call_screen') {
      setActiveTab('video_call');
      setVideoCallMode('card');
      setCallStatus(msg.callStatus?.replace(/^●\s*/, '') || '视频通话进行中');
      setCallDuration(msg.callDuration || '18:42');
    } else {
      setActiveTab(msg.type);
    }

    if (msg.type === 'text') {
      setTextContent(msg.content || '');
      if (msg.quoteText) {
        setHasQuote(true);
        setQuoteSender(msg.quoteSender || '');
        setQuoteText(msg.quoteText);
      } else {
        setHasQuote(false);
      }
    } else if (msg.type === 'video_call') {
      setVideoCallMode('bubble');
      setCallStatus(msg.callStatus || '视频通话已取消');
    } else if (msg.type === 'voice_call') {
      setVoiceCallStatus(msg.callStatus || '通话时长 05:21');
    } else if (msg.type === 'voice') {
      setVoiceSeconds(msg.duration?.replace("''", '') || '12');
      setVoiceUnread(!!msg.isUnread);
    } else if (msg.type === 'redpacket') {
      setPacketDesc(msg.packetDesc || '恭喜发财，大吉大利');
      setPacketStatus(msg.packetStatus || '领取红包');
    } else if (msg.type === 'transfer') {
      setTransferAmount(msg.amount || '¥ 520.00');
      setTransferNote(msg.content || '请查收转账');
    } else if (msg.type === 'image') {
      setImageDesc(msg.mediaDesc || '照片');
      setImageSize(msg.mediaSize || '1.8 MB');
      setImageUrl(msg.mediaUrl || '');
    } else if (msg.type === 'blocked') {
      setBlockedContent(msg.content || '');
    } else if (msg.type === 'time') {
      setTimeText(msg.content || '今天 01:24');
    } else if (msg.type === 'system_notice') {
      setSystemNoticeText(msg.systemText || msg.content || '');
    }
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setTextContent('');
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AO3
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-800">微信聊天排版工作台</h2>
            <p className="text-[11px] text-stone-500">点选生成，无需写代码 • 实时同步右侧预览</p>
          </div>
        </div>

        {onLoadPresetStory && (
          <button
            type="button"
            onClick={onLoadPresetStory}
            className="text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1"
            title="重新填入官方示例对话剧本"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>载入示例故事</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Section 1: 预设人物库 */}
        <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-stone-600" />
              <span className="text-xs font-bold text-stone-700">预设人物与发信人选择</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                点击切换当前发言角色
              </span>
            </div>
            <button
              type="button"
              onClick={openAddChar}
              className="text-xs text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded flex items-center gap-1 transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建人物</span>
            </button>
          </div>

          {/* Character chips */}
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => {
              const isSelected = char.id === activeSenderId;
              return (
                <div
                  key={char.id}
                  onClick={() => setActiveSenderId(char.id)}
                  className={`group relative flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full cursor-pointer border transition-all text-xs ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0"
                    style={{ backgroundColor: char.color }}
                  >
                    {char.shortName}
                  </div>
                  <span className="font-medium">{char.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-stone-800 text-stone-200'
                        : char.isMe
                        ? 'bg-emerald-100 text-emerald-700 font-semibold'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {char.isMe ? '主角(右)' : '对方(左)'}
                  </span>

                  {/* Quick edit */}
                  <button
                    type="button"
                    onClick={(e) => openEditChar(char, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity ml-0.5"
                    title="编辑此人物"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Quick delete */}
                  {characters.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChar(char.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-500 hover:text-white transition-opacity"
                      title="删除角色"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: 群聊/单聊顶栏设置 */}
        <div className="bg-white rounded-lg border border-stone-200 p-3 shadow-xs flex items-center gap-3 text-xs">
          <Settings2 className="w-4 h-4 text-stone-500 flex-shrink-0" />
          <div className="flex-1 flex items-center gap-2">
            <label className="text-stone-500 font-medium whitespace-nowrap">聊天名称:</label>
            <input
              type="text"
              value={chatMeta.title}
              onChange={(e) => onUpdateChatMeta({ ...chatMeta, title: e.target.value })}
              className="flex-1 px-2 py-1 bg-stone-50 border border-stone-200 rounded text-stone-800 focus:bg-white focus:outline-none focus:border-stone-400"
              placeholder="例如：特策小组执行群 (4)"
            />
          </div>
          <div className="w-28 flex items-center gap-1.5">
            <label className="text-stone-500 font-medium whitespace-nowrap">返回未读:</label>
            <input
              type="text"
              value={chatMeta.backCount}
              onChange={(e) => onUpdateChatMeta({ ...chatMeta, backCount: e.target.value })}
              className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-stone-800 focus:bg-white focus:outline-none focus:border-stone-400"
              placeholder="42"
            />
          </div>
        </div>

        {/* Section 3: 发送消息编辑器 */}
        <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800">
                {editingMsgId ? '正在修改消息' : '添加新消息'}
              </span>
              <span className="text-[11px] text-stone-500">
                当前发言：
                <strong className="text-stone-800">
                  {characters.find((c) => c.id === activeSenderId)?.name || '我'}
                </strong>
              </span>
            </div>

            {editingMsgId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                取消修改
              </button>
            )}
          </div>

          {/* Message Type Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-stone-200 pb-2 mb-3">
            {[
              { type: 'text', label: '文字对话', icon: MessageSquare },
              { type: 'video_call', label: '视频通话(逼真)', icon: Video },
              { type: 'voice_call', label: '语音通话', icon: Phone },
              { type: 'voice', label: '语音条', icon: Mic },
              { type: 'redpacket', label: '微信红包', icon: Gift },
              { type: 'transfer', label: '微信转账', icon: DollarSign },
              { type: 'image', label: '图片发送', icon: ImageIcon },
              { type: 'blocked', label: '拒收感叹号', icon: AlertCircle },
              { type: 'friend_verify', label: '非好友验证', icon: UserCheck },
              { type: 'time', label: '时间居中戳', icon: Clock },
              { type: 'system_notice', label: '系统/拍一拍', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setActiveTab(tab.type as MessageType)}
                  className={`px-2.5 py-1.2 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Input for Active Tab */}
          <div className="space-y-3">
            {/* 1. TEXT */}
            {activeTab === 'text' && (
              <div className="space-y-2.5">
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 bg-stone-50 focus:bg-white resize-none"
                  placeholder="输入发出的聊天消息内容，支持换行..."
                />

                {/* Quote check */}
                <div className="border-t border-stone-100 pt-2 space-y-2">
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasQuote}
                      onChange={(e) => setHasQuote(e.target.checked)}
                      className="rounded text-rose-700 focus:ring-0"
                    />
                    <span>引用某条发言（微信引用回复效果）</span>
                  </label>

                  {hasQuote && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-1">被引用人名:</label>
                        <input
                          type="text"
                          value={quoteSender}
                          onChange={(e) => setQuoteSender(e.target.value)}
                          placeholder="例如: 楚副队"
                          className="w-full px-2 py-1 rounded border border-stone-200 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-stone-500 mb-1">被引用的原内容:</label>
                        <input
                          type="text"
                          value={quoteText}
                          onChange={(e) => setQuoteText(e.target.value)}
                          placeholder="例如: 今晚十点在旧码头碰头。"
                          className="w-full px-2 py-1 rounded border border-stone-200 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. VIDEO CALL (逼真视频通话) */}
            {activeTab === 'video_call' && (
              <div className="space-y-3 bg-stone-50/80 p-3 rounded-lg border border-stone-200 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">视频通话展现样式：</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoCallMode('bubble')}
                      className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 ${
                        videoCallMode === 'bubble'
                          ? 'border-rose-600 bg-rose-50/60 font-semibold text-rose-900'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <span className="text-xs">💬 微信聊天流气泡</span>
                      <span className="text-[10px] font-normal text-stone-500">
                        微信内联通话记录，带高逼真矢量摄像机图标
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVideoCallMode('card')}
                      className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 ${
                        videoCallMode === 'card'
                          ? 'border-rose-600 bg-rose-50/60 font-semibold text-rose-900'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <span className="text-xs">📱 高仿真全屏呼叫卡片</span>
                      <span className="text-[10px] font-normal text-stone-500">
                        深夜接通视频电话名场面，带大头像与挂断三联按键
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-stone-600 mb-1">通话状态文案：</label>
                    <select
                      value={callStatus}
                      onChange={(e) => setCallStatus(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                    >
                      <option value="视频通话已取消">视频通话已取消</option>
                      <option value="视频通话进行中">视频通话进行中</option>
                      <option value="对方已拒绝">对方已拒绝</option>
                      <option value="对方已取消">对方已取消</option>
                      <option value="未应答">未应答</option>
                      <option value="已挂断">已挂断</option>
                    </select>
                  </div>

                  {videoCallMode === 'card' && (
                    <div>
                      <label className="block text-stone-600 mb-1">通话时长计时：</label>
                      <input
                        type="text"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        placeholder="例如: 18:42 或 00:03"
                        className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. VOICE CALL */}
            {activeTab === 'voice_call' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">语音通话状态：</label>
                  <input
                    type="text"
                    value={voiceCallStatus}
                    onChange={(e) => setVoiceCallStatus(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                    placeholder="例如: 通话时长 05:21 或 语音通话已取消"
                  />
                </div>
              </div>
            )}

            {/* 4. VOICE */}
            {activeTab === 'voice' && (
              <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <div className="flex items-center gap-1.5">
                  <label className="text-stone-600">语音秒数:</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={voiceSeconds}
                    onChange={(e) => setVoiceSeconds(e.target.value)}
                    className="w-16 px-2 py-1 rounded border border-stone-200 bg-white"
                  />
                  <span>秒</span>
                </div>
                <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceUnread}
                    onChange={(e) => setVoiceUnread(e.target.checked)}
                    className="rounded text-rose-700"
                  />
                  <span>显示未读红点（仅左侧对方消息有效）</span>
                </label>
              </div>
            )}

            {/* 5. RED PACKET */}
            {activeTab === 'redpacket' && (
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">红包寄语:</label>
                  <input
                    type="text"
                    value={packetDesc}
                    onChange={(e) => setPacketDesc(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                    placeholder="恭喜发财，大吉大利"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">领取状态:</label>
                  <select
                    value={packetStatus}
                    onChange={(e) => setPacketStatus(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                  >
                    <option value="领取红包">领取红包</option>
                    <option value="已被领完">已被领完</option>
                    <option value="已过期">已过期</option>
                  </select>
                </div>
              </div>
            )}

            {/* 6. TRANSFER */}
            {activeTab === 'transfer' && (
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">转账金额:</label>
                  <input
                    type="text"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                    placeholder="¥ 520.00"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">转账说明备注:</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                    placeholder="请查收转账"
                  />
                </div>
              </div>
            )}

            {/* 7. IMAGE */}
            {activeTab === 'image' && (
              <div className="space-y-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-600 mb-1">图片名/说明:</label>
                    <input
                      type="text"
                      value={imageDesc}
                      onChange={(e) => setImageDesc(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                      placeholder="例如: 监控截图_03.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">模拟文件大小:</label>
                    <input
                      type="text"
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                      placeholder="1.8 MB"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">
                    真实图片 URL (可选，留空则展示高保真占位图):
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* 8. BLOCKED */}
            {activeTab === 'blocked' && (
              <div className="space-y-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-200 text-xs">
                <label className="block text-rose-800 font-medium">
                  发出的消息（自动附加红色感叹号并提示“消息已发出，但被对方拒收了”）：
                </label>
                <input
                  type="text"
                  value={blockedContent}
                  onChange={(e) => setBlockedContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-rose-300 bg-white text-stone-800"
                  placeholder="你在哪里？为什么不接电话？"
                />
              </div>
            )}

            {/* 9. FRIEND VERIFY */}
            {activeTab === 'friend_verify' && (
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs text-stone-600">
                将插入灰色系统提示：
                <span className="block mt-1 font-mono text-stone-700 bg-white p-1.5 rounded border">
                  “对方开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求...”
                </span>
              </div>
            )}

            {/* 10. TIME */}
            {activeTab === 'time' && (
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <label className="block text-stone-600 mb-1">时间戳文字:</label>
                <input
                  type="text"
                  value={timeText}
                  onChange={(e) => setTimeText(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                  placeholder="例如: 昨天 23:15 或 今天 02:40"
                />
              </div>
            )}

            {/* 11. SYSTEM NOTICE */}
            {activeTab === 'system_notice' && (
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
                <label className="block text-stone-600 mb-1">系统提示/拍一拍文字:</label>
                <input
                  type="text"
                  value={systemNoticeText}
                  onChange={(e) => setSystemNoticeText(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-stone-200 bg-white"
                  placeholder="例如: 你拍了拍“陆顾问” 或 楚副队撤回了一条消息"
                />
              </div>
            )}

            {/* Commit Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCommitMessage}
                className="flex-1 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {editingMsgId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingMsgId ? '保存修改并更新预览' : '添加此消息到聊天记录'}</span>
              </button>
              {editingMsgId && (
                <button
                  type="button"
                  onClick={() => setEditingMsgId(null)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: 消息时间线列表 */}
        <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-700">消息列表与排版顺序</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono font-medium">
                {messages.length} 条
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                ref={quickFileInputRef}
                type="file"
                accept=".html,.htm,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleQuickFileImport(f);
                }}
              />
              {onOpenArchiveModal && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenArchiveModal('import')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded font-medium"
                    title="一键导入 HTML 或 JSON 存档文件恢复到工作台"
                  >
                    <Upload className="w-3 h-3 text-emerald-600" />
                    <span>导入存档</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenArchiveModal('export')}
                    className="text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded"
                    title="导出离线可预览的 HTML 存档"
                  >
                    <Download className="w-3 h-3 text-stone-600" />
                    <span>导出存档</span>
                  </button>
                </>
              )}

              {messages.length > 0 && (
                showClearConfirm ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] shadow-xs">
                    <span className="text-rose-800 font-medium">确定清空全部消息？</span>
                    <button
                      type="button"
                      onClick={handleClearAllMessages}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-colors cursor-pointer"
                    >
                      确定清空
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-1.5 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer py-0.5 px-1.5 rounded hover:bg-rose-50"
                    title="清空当前所有消息记录"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空全部</span>
                  </button>
                )
              )}
            </div>
          </div>

          {messages.length > 1 && (
            <div className="text-[11px] text-stone-500 mb-2.5 flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-md border border-stone-200/80">
              <GripVertical className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>
                按住左侧 <span className="font-semibold text-stone-700">⠿ 手柄可拖拽排序</span>，亦可点击右侧箭头微调。
              </span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-7 text-stone-400 text-xs border border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center gap-2.5">
              <p>消息列表已清空，请使用上方面板添加您的聊天对话！</p>
              {onLoadPresetStory && (
                <button
                  type="button"
                  onClick={onLoadPresetStory}
                  className="px-3 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>载入示例对话故事</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {messages.map((msg, index) => {
                const sender = characters.find((c) => c.id === msg.senderId) || {
                  id: 'unknown',
                  name: '未知',
                  shortName: '?',
                  color: '#666',
                  isMe: false,
                };
                const isBeingEdited = editingMsgId === msg.id;
                const isDraggingThis = draggedIndex === index;
                const isOverThis = dragOverIndex === index && draggedIndex !== index;

                let summary = '';
                if (msg.type === 'text') summary = msg.content || '';
                else if (msg.type === 'video_call') summary = `[视频通话] ${msg.callStatus}`;
                else if (msg.type === 'call_screen') summary = `[全屏呼叫] ${msg.callStatus} (${msg.callDuration})`;
                else if (msg.type === 'voice_call') summary = `[语音通话] ${msg.callStatus}`;
                else if (msg.type === 'voice') summary = `[语音条] ${msg.duration}`;
                else if (msg.type === 'redpacket') summary = `[红包] ${msg.packetDesc}`;
                else if (msg.type === 'transfer') summary = `[转账] ${msg.amount}`;
                else if (msg.type === 'image') summary = `[图片] ${msg.mediaDesc}`;
                else if (msg.type === 'blocked') summary = `[拒收!] ${msg.content}`;
                else if (msg.type === 'friend_verify') summary = '[非好友验证提醒]';
                else if (msg.type === 'time') summary = `[时间戳] ${msg.content}`;
                else if (msg.type === 'system_notice') summary = `[系统提示] ${msg.systemText}`;

                return (
                  <div
                    key={msg.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={(e) => handleDragLeave(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all text-xs select-none ${
                      isDraggingThis
                        ? 'opacity-30 border-dashed border-stone-400 bg-stone-100 scale-[0.98]'
                        : isOverThis
                        ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-400/50'
                        : isBeingEdited
                        ? 'bg-rose-50 border-rose-400 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700 p-0.5 -ml-0.5 rounded transition-colors flex-shrink-0"
                        title="按住鼠标拖拽以调整消息顺序"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0"
                        style={{ backgroundColor: sender.color }}
                      >
                        {sender.shortName}
                      </div>
                      <span className="font-semibold text-stone-700 whitespace-nowrap">
                        {sender.name}:
                      </span>
                      <span className="truncate text-stone-600">{summary}</span>
                    </div>

                    <div
                      className="flex items-center gap-1 flex-shrink-0"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {/* Move up */}
                      <button
                        type="button"
                        onClick={() => moveMessage(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-stone-500 hover:text-stone-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="上移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move down */}
                      <button
                        type="button"
                        onClick={() => moveMessage(index, 'down')}
                        disabled={index === messages.length - 1}
                        className="p-1 rounded text-stone-500 hover:text-stone-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="下移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => startEditMessage(msg)}
                        className="p-1 rounded text-stone-500 hover:text-stone-800 cursor-pointer"
                        title="编辑"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add or Edit Character */}
      {isCharModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-stone-200">
            <h3 className="text-sm font-bold text-stone-800 mb-3">
              {editingCharId ? '编辑预设人物' : '新建预设人物'}
            </h3>

            <form onSubmit={handleSaveChar} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">人物全名/显示昵称:</label>
                <input
                  type="text"
                  required
                  value={charFormName}
                  onChange={(e) => setCharFormName(e.target.value)}
                  placeholder="例如: 楚副队 或 陆顾问"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-400 text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    头像单字 (留空取末尾字):
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={charFormShort}
                    onChange={(e) => setCharFormShort(e.target.value)}
                    placeholder="楚"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-400 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">发言气泡位置:</label>
                  <select
                    value={charFormIsMe ? 'true' : 'false'}
                    onChange={(e) => setCharFormIsMe(e.target.value === 'true')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-400 text-stone-800"
                  >
                    <option value="false">对方/群友 (左侧白气泡)</option>
                    <option value="true">主角/我方 (右侧绿气泡)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1.5">头像背景色彩:</label>
                <div className="flex items-center gap-2">
                  {PRESET_AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCharFormColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        charFormColor === c ? 'scale-115 border-stone-800 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={charFormColor}
                    onChange={(e) => setCharFormColor(e.target.value)}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                    title="自定义颜色"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  真实头像图片外链 URL (可选):
                </label>
                <input
                  type="text"
                  value={charFormAvatarUrl}
                  onChange={(e) => setCharFormAvatarUrl(e.target.value)}
                  placeholder="https://... (留空则显示单字头像)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-400 text-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCharModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-medium transition-colors shadow-xs"
                >
                  保存人物
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
