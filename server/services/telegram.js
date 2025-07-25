const TelegramBot = require('node-telegram-bot-api');
const dotenv=require('dotenv').config()
class TelegramService {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token';
    this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || 'admin-chat-id';
    
    if (this.token && this.token !== 'your-telegram-bot-token') {
      this.bot = new TelegramBot(this.token, { polling: false });
    } else {
      console.warn('Telegram bot token not configured');
      this.bot = null;
    }
  }

  async sendMessage(chatId, message) {
    if (!this.bot) {
      console.log('Telegram message (bot not configured):', message);
      return;
    }

    try {
      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      console.error('Telegram send message error:', error);
    }
  }

  async sendToAdmin(message) {
    if (!this.adminChatId || this.adminChatId === 'admin-chat-id') {
      console.log('Admin Telegram message:', message);
      return;
    }

    await this.sendMessage(this.adminChatId, message);
  }

  async sendWelcomeMessage(chatId, userFullName, referralCode) {
    const message = `
🎉 Welcome to Saham Trading, ${userFullName}!

Your account has been created successfully.

📋 Your Referral Code: ${referralCode}

💰 Investment Packages:
• Full Stock Package: 70,000 ETB (20% monthly return)
• Half Stock Package: 35,000 ETB (20% monthly return)
• Quarter Stock Package: 17,500 ETB (20% monthly return)
• Minimum Stock Package: 7,000 ETB (20% monthly return)

🤝 MLM Commission Structure:
• Level 1: 8% commission
• Level 2: 4% commission
• Level 3: 2% commission
• Level 4: 1% commission

Start your investment journey today!
    `;

    await this.sendMessage(chatId, message);
  }

  async sendDepositNotification(chatId, amount, packageName, status) {
    const statusEmoji = status === 'completed' ? '✅' : status === 'rejected' ? '❌' : '⏳';
    const message = `
${statusEmoji} Deposit Update

Package: ${packageName}
Amount: ${amount.toLocaleString()} ETB
Status: ${status.charAt(0).toUpperCase() + status.slice(1)}

${status === 'completed' ? 'Your investment is now active!' : 
  status === 'rejected' ? 'Please contact support for assistance.' : 
  'Your deposit is being processed.'}
    `;

    await this.sendMessage(chatId, message);
  }

  async sendCommissionNotification(chatId, amount, level, fromUser) {
    const message = `
💰 Commission Earned!

Amount: ${amount.toLocaleString()} ETB
Level: ${level}
From: ${fromUser}

Your commission has been added to your balance.
    `;

    await this.sendMessage(chatId, message);
  }

  async sendWithdrawalNotification(chatId, amount, status, rejectionReason = null) {
    const statusEmoji = status === 'completed' ? '✅' : status === 'rejected' ? '❌' : '⏳';
    let message = `
${statusEmoji} Withdrawal Update

Amount: ${amount.toLocaleString()} ETB
Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
    `;

    if (status === 'rejected' && rejectionReason) {
      message += `\nReason: ${rejectionReason}`;
    }

    await this.sendMessage(chatId, message);
  }
}

module.exports = new TelegramService();