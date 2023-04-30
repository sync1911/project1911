const chatBox = document.getElementById('chat-box');
const chatInputForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');

// Sample function to simulate receiving a message from the bot
function receiveBotMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message bot-message';
  messageElement.textContent = message;
}