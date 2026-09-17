export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  line?: number;
  rule: string;
  fixSuggestion?: string;
}

export interface WorkTemplate {
  id: string;
  title: string;
  tag: string;
  description: string;
  css: string;
  html: string;
}

export type ThemeMode = 'default' | 'reversi';
export type ViewportMode = 'desktop' | 'mobile';

export interface ChatCharacter {
  id: string;
  name: string;
  shortName: string;
  color: string;
  isMe: boolean;
  avatarUrl?: string;
}

export type MessageType =
  | 'text'
  | 'quote'
  | 'image'
  | 'redpacket'
  | 'transfer'
  | 'voice'
  | 'video_call'
  | 'voice_call'
  | 'call_screen'
  | 'system_notice'
  | 'blocked'
  | 'friend_verify'
  | 'time';

export interface ChatMessage {
  id: string;
  type: MessageType;
  senderId: string;
  content?: string;
  quoteSender?: string;
  quoteText?: string;
  mediaUrl?: string;
  mediaDesc?: string;
  mediaSize?: string;
  duration?: string;
  isUnread?: boolean;
  callStatus?: string;
  callDuration?: string;
  packetDesc?: string;
  packetStatus?: string;
  amount?: string;
  systemText?: string;
}
