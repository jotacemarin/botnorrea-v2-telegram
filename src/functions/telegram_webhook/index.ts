import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST, NO_CONTENT } from "http-status";
import axios from "axios";
import { Command, UpdateTg, User } from "../../lib/models";
import { getTextCommand } from "../../lib/utils/telegramHelper";
import { CommandDao } from "../../lib/dao/commandDao";
import { UserDao } from "../../lib/dao/userDao";

const getCommand = async (key: string): Promise<Command | null> => {
  await CommandDao.initInstance();
  return CommandDao.findByKey(key);
};

const sendToEndpointCommand = async (
  body: UpdateTg,
  key: string
): Promise<{ statusCode: number }> => {
  const command = await getCommand(key);
  if (command?.enabled) {
    console.log(`${command.key}: ${command.url}`);
    await axios.post(command.url, body);
    return { statusCode: OK };
  }

  return { statusCode: NO_CONTENT };
};

const saveUser = async (body: UpdateTg): Promise<void> => {
  await UserDao.initInstance();
  const { from } = body?.message ?? {};
  const user: User = {
    id: String(from?.id),
    username: from?.username,
    firstname: from?.first_name,
    lastname: from?.last_name,
  };
  await UserDao.save(user);
  return;
};

const execute = async (body: UpdateTg): Promise<{ statusCode: number }> => {
  if (body?.message?.from?.is_bot) {
    return { statusCode: OK };
  }

  await saveUser(body);

  const key = getTextCommand(body);
  if (key) {
    return sendToEndpointCommand(body, key);
  }

  return { statusCode: NO_CONTENT };
};

export const telegramWebhook = async (
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
