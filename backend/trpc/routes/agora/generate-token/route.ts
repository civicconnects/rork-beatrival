import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export const generateTokenProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string(),
      uid: z.number().optional().default(0),
      role: z.number().optional().default(1), // 1 = host, 2 = audience
    })
  )
  .mutation(async ({ input }: { input: { channelName: string; uid?: number; role?: number } }) => {
    // Use your provided Agora credentials
    const appId = '4a6fd7540b324275bab0f8f82def07aa';
    const appCertificate = '12a1828565d14960a78234eb4933a46d';
    
    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }
    
    const expireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const uid = input.uid ?? 0;
    
    // For now, we'll generate a simple token placeholder
    // In production, you would use the agora-access-token package
    // Since we can't install it in Expo Go, we'll simulate the token
    const token = `simulated-token-${input.channelName}-${uid}-${input.role}-${expireTime}`;
    
    console.log('Generated Agora token for channel:', input.channelName);
    
    return {
      token,
      appId,
      channelName: input.channelName,
      uid,
      expireTime,
    };
  });