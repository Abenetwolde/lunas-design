import { getSiteSettings } from './supabase';

/**
 * Telegram Auto-Posting Service for Hiwi Fashion
 * Broadcasts newly created products to Telegram Channel / Group (@hiwifashion12)
 */

export interface BroadcastProductOptions {
  id?: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  category: string;
  description?: string;
  image?: string;
  material?: string;
}

/**
 * Fetch live bot details from Telegram API (getMe)
 */
export async function getTelegramBotInfo(botToken: string): Promise<{
  ok: boolean;
  username?: string;
  firstName?: string;
  canJoinGroups?: boolean;
  error?: string;
}> {
  if (!botToken.trim()) {
    return { ok: false, error: 'Bot Token is required' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`);
    const data = await res.json();
    if (data.ok && data.result) {
      return {
        ok: true,
        username: data.result.username,
        firstName: data.result.first_name,
        canJoinGroups: data.result.can_join_groups,
      };
    }
    return { ok: false, error: data.description || 'Invalid Bot Token' };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to fetch Bot Info' };
  }
}

export async function postProductToTelegramGroup(
  product: BroadcastProductOptions,
  overrideSettings?: { botToken?: string; groupUsername?: string; contactPhone?: string }
): Promise<{ success: boolean; error?: string }> {
  let botToken = overrideSettings?.botToken;
  let groupUsername = overrideSettings?.groupUsername;
  let contactPhone = overrideSettings?.contactPhone;

  try {
    const settings = await getSiteSettings();
    botToken = botToken || settings.telegramBotToken || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '8754528608:AAGbDG_ilyMr_iNUxXfi5tlhhMG_i2nA-uY';
    groupUsername = groupUsername || settings.telegramChannel || process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || '@hiwifashion12';
    contactPhone = contactPhone || settings.contactPhone || '+251 911 234 567';
  } catch (e) {
    botToken = botToken || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '8754528608:AAGbDG_ilyMr_iNUxXfi5tlhhMG_i2nA-uY';
    groupUsername = groupUsername || process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || '@hiwifashion12';
    contactPhone = contactPhone || '+251 911 234 567';
  }

  // Sanitize group username (convert https://t.me/hiwifashion12 or hiwifashion12 to @hiwifashion12)
  if (groupUsername.includes('t.me/')) {
    const parts = groupUsername.split('t.me/');
    const raw = parts[parts.length - 1].replace('/', '').trim();
    if (raw) groupUsername = raw.startsWith('@') ? raw : `@${raw}`;
  } else if (!groupUsername.startsWith('@') && !groupUsername.startsWith('-')) {
    groupUsername = `@${groupUsername.trim()}`;
  }

  if (!botToken || !groupUsername) {
    return { success: false, error: 'Telegram bot token or group username missing' };
  }

  const siteUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://lunas-design.vercel.app';
  const slug = product.slug || product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const productUrl = `${siteUrl}/product/${slug}`;

  const phoneDisplay = contactPhone || '+251 911 234 567';
  const phoneClean = phoneDisplay.replace(/[^\d+]/g, '');

  const caption =
    `<b>${product.name.toUpperCase()}</b>\n\n` +
    `Category: ${product.category.toUpperCase()}\n` +
    (product.material ? `Fabric: ${product.material}\n` : '') +
    `\n${product.description || 'Authentic handcrafted Habesha garment.'}\n\n` +
    `📞 <b>Call / Phone:</b> ${phoneDisplay}\n` +
    `Fast delivery available in Addis Ababa.\n` +
    `Click below to view details and order:`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: 'View & Order Product', url: productUrl },
        { text: 'Order via Telegram', url: 'https://t.me/abigel2' },
      ],
      [
        { text: `📞 Call Store (${phoneDisplay})`, url: `tel:${phoneClean}` },
      ],
    ],
  };

  try {
    const hasRemoteImage =
      product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'));

    if (hasRemoteImage) {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupUsername,
          photo: product.image,
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });

      const resData = await response.json();
      if (resData.ok) {
        return { success: true };
      }
      console.warn('Telegram sendPhoto response:', resData);
    }

    // Fallback to text message
    const textMsgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupUsername,
        text: caption,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });

    const resData = await textMsgResponse.json();

    if (!resData.ok && resData.description) {
      if (resData.description.includes('not a member') || resData.description.includes('not an admin') || resData.description.includes('Forbidden')) {
        return {
          success: false,
          error: `Bot is not an Administrator of ${groupUsername} yet. Please add your bot as Admin in Telegram.`,
        };
      }
    }

    return { success: Boolean(resData.ok), error: resData.description };
  } catch (err: any) {
    console.error('Error posting product to Telegram group:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Test Telegram bot token and group username connection
 */
export async function testTelegramBroadcast(
  botToken: string,
  groupUsername: string
): Promise<{ success: boolean; error?: string }> {
  let cleanGroup = groupUsername.trim();
  if (cleanGroup.includes('t.me/')) {
    const parts = cleanGroup.split('t.me/');
    const raw = parts[parts.length - 1].replace('/', '').trim();
    if (raw) cleanGroup = raw.startsWith('@') ? raw : `@${raw}`;
  } else if (!cleanGroup.startsWith('@') && !cleanGroup.startsWith('-')) {
    cleanGroup = `@${cleanGroup}`;
  }

  if (!botToken.trim() || !cleanGroup) {
    return { success: false, error: 'Both Bot Token and Group Username are required.' };
  }

  const testMessage =
    `🤖 <b>Telegram Channel Connection Successful!</b>\n\n` +
    `Your Hiwi Fashion Storefront bot token and group URL are configured correctly in the Supabase database.\n\n` +
    `New products will automatically broadcast photo posts to this group! 🚀`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanGroup,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    }

    if (data.description && (data.description.includes('not a member') || data.description.includes('not an admin') || data.description.includes('Forbidden'))) {
      return {
        success: false,
        error: `Bot is NOT an Admin of ${cleanGroup} yet! Please add the bot as Administrator in Telegram settings.`,
      };
    }

    return { success: false, error: data.description || 'Telegram API returned error.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network request failed' };
  }
}
