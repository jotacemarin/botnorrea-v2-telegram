import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { BAD_REQUEST, OK } from "http-status";
import { ChatMessageDao } from "../../lib/dao";

const execute = async (event: APIGatewayEvent): Promise<any> => {
  if (!event?.queryStringParameters?.chat_id) {
    return { statusCode: BAD_REQUEST };
  }

  const chatId = Number(event.queryStringParameters.chat_id);

  await ChatMessageDao.initInstance();
  const messages = await ChatMessageDao.getAll(chatId);

  return { statusCode: OK, body: JSON.stringify(messages) };
};

export const telegramGetMessages = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
): Promise<void> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const response = await execute(event);

  return callback(null, response);
};
