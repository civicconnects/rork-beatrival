// Web-only Agora SDK loader
// This file should only be imported on web platform

export interface AgoraClient {
  join(appId: string, channel: string, token: string, uid: number): Promise<any>;
  leave(): Promise<void>;
  publish(tracks: any[]): Promise<void>;
  subscribe(user: any, mediaType: string): Promise<void>;
  setClientRole(role: string): Promise<void>;
  on(event: string, callback: (...args: any[]) => void): void;
  remoteUsers: any[];
}

export interface AgoraSDK {
  createClient(config: { mode: string; codec: string }): AgoraClient;
  createMicrophoneAudioTrack(): Promise<any>;
  createCameraVideoTrack(config?: any): Promise<any>;
}

let cachedAgoraRTC: AgoraSDK | null = null;

export async function getAgoraSDK(): Promise<AgoraSDK | null> {
  if (cachedAgoraRTC) {
    return cachedAgoraRTC;
  }

  try {
    const AgoraRTC = await import('agora-rtc-sdk-ng');
    cachedAgoraRTC = AgoraRTC.default as unknown as AgoraSDK;
    return cachedAgoraRTC;
  } catch (error) {
    console.error('Failed to load Agora SDK:', error);
    return null;
  }
}
