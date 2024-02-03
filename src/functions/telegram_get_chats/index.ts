import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST } from "http-status";
import { TelegramService } from "../../lib/services";
import { UserTg } from "../../lib/models";

const getChat = async (
  chatId: number | string,
  userId: number | string
): Promise<{
  group: { id: number | string; title: string };
  user: UserTg;
  status: string;
} | null> => {
  try {
    const {
      data: {
        result: { id, title },
      },
    } = await TelegramService.getChat(chatId);
    const {
      data: {
        result: { user, status },
      },
    } = await TelegramService.getChatMember(chatId, userId);
    return { group: { id, title }, user, status };
  } catch {
    return null;
  }
};

const execute = async (body: {
  user: number | string;
  chats: Array<number | string>;
}): Promise<{ statusCode: number; body?: string }> => {
  TelegramService.initInstance();

  const responses = await Promise.all(
    body?.chats?.map(async (chatId) => getChat(chatId, body?.user))
  );

  const chats = responses?.filter((response) => Boolean(response));

  return { statusCode: OK, body: JSON.stringify(chats) };
};

export const telegramGetChats = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
): Promise<void> => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event?.body) {
    return callback(null, { statusCode: BAD_REQUEST });
  }

  const body = JSON.parse(event?.body);
  const response = await execute(body);
  return callback(null, response);
};
