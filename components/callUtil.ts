import { METHODS } from '@/constants';
import { i18n } from 'next-i18next';

export async function getChatGptAnswer(messagesWithSender: { message: string; sender: string }[]) {
  i18n?.init();

  const chatGptApiFormattedMessages = messagesWithSender.map(messageObject => {
    return {
      role: messageObject.sender === 'ChatGPT' ? 'model' : 'user' || 'system',
      parts: [{ text: messageObject.message }],
    };
  });

  const systemMessageToSetChatGptBehaviour = {
    role: 'model',
    parts: [{ text: i18n?.t('bob.systemMessage') }],
  };
  let usermessage =
    chatGptApiFormattedMessages[chatGptApiFormattedMessages.length - 1].parts[0].text;
  chatGptApiFormattedMessages[
    chatGptApiFormattedMessages.length - 1
  ].parts[0].text = `translate "${usermessage}" to ja-JP if it is already in ja-JP then translate it to ${i18n?.language} , return the tranlsation in the output and nothing else`;

  const chatGptApiMessages = [
    systemMessageToSetChatGptBehaviour, // The system message DEFINES the logic of our chatGPT
    ...chatGptApiFormattedMessages, // The messages from our chat with ChatGPT
  ];

  // console.log(
  //   (chatGptApiFormattedMessages[chatGptApiFormattedMessages.length - 1].parts[0].text = '')
  // );
  try {
    const response = await fetch(`/api/chat/message`, {
      method: METHODS.POST,
      body: JSON.stringify(chatGptApiMessages),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data_res = await response.json();
    console.log(response);
    // const { choices } = data;
    console.log(data_res);
    return data_res.response;
  } catch (error) {
    console.error('Error:', error);
  }
}
