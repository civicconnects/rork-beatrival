import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import crypto from "crypto";

// Agora token generation logic
function generateAgoraToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number,
  expireTime: number
): string {
  // Validate inputs
  if (!appId?.trim() || appId.length > 100) throw new Error('Invalid appId');
  if (!appCertificate?.trim() || appCertificate.length > 100) throw new Error('Invalid appCertificate');
  if (!channelName?.trim() || channelName.length > 100) throw new Error('Invalid channelName');
  
  // This is a simplified token generation
  // In production, use the official Agora token generation library
  const message = `${appId}${channelName}${uid}${role}${expireTime}`;
  const signature = crypto
    .createHmac('sha256', appCertificate)
    .update(message)
    .digest('hex');
  
  return `${appId}:${signature}:${expireTime}`;
}

export const generateTokenProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string(),
      uid: z.number().optional().default(0),
      role: z.number().optional().default(1), // 1 = host, 2 = audience
    })
  )
  .mutation(async ({ input }: { input: { channelName: string; uid?: number; role?: number } }) => {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }
    
    const expireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const token = generateAgoraToken(
      appId,
      appCertificate,
      input.channelName,
      input.uid ?? 0,
      input.role ?? 1,
      expireTime
    );
    
    return {
      token,
      appId,
      channelName: input.channelName,
      uid: input.uid,
      expireTime,
    };
  });