import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export const generateTokenProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string(),
      uid: z.number().optional().default(0),
      role: z.number().optional().default(1), // 1 = host, 2 = audience
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Use your provided Agora credentials
      const appId = '4a6fd7540b324275bab0f8f82def07aa';
      const appCertificate = '12a1828565d14960a78234eb4933a46d';
      
      if (!appId || !appCertificate) {
        throw new Error('Agora credentials not configured');
      }
      
      const expireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const uid = input.uid ?? 0;
      
      // Convert role number to Agora role
      const agoraRole = input.role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
      
      // Generate real Agora RTC token
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        input.channelName,
        uid,
        agoraRole,
        expireTime
      );
      
      console.log('Generated real Agora token for channel:', input.channelName, {
        uid,
        role: input.role === 1 ? 'PUBLISHER' : 'SUBSCRIBER',
        expireTime: new Date(expireTime * 1000).toISOString()
      });
      
      return {
        token,
        appId,
        channelName: input.channelName,
        uid,
        expireTime,
        role: input.role,
      };
    } catch (error) {
      console.error('Failed to generate Agora token:', error);
      throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });