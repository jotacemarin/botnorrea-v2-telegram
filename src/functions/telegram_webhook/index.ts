import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST, NO_CONTENT } from "http-status";
import axios from "axios";
import { Command, UpdateTg, User } from "../../lib/models";
import { getTextCommand } from "../../lib/utils/telegramHelper";
import { CommandDao } from "../../lib/dao/commandDao";
import { UserDao } from "../../lib/dao/userDao";
import { MessageTg } from "../../lib/models/telegram";

const { STAGE } = process.env;

const getCommand = async (
  message: MessageTg | undefined
): Promise<Command | null> => {
  if (!message) {
    return null;
  }

  const key = getTextCommand(message);
  if (!key) {
    return null;
  }

  return CommandDao.findByKey(key);
};

const request = async (command: Command, body: UpdateTg) => {
  try {
    console.log(`${command.key}: ${command.url}`);
    await axios.post(command.url, body);
  } finally {
    return;
  }
};

const executeCallbackQuery = async (body: UpdateTg): Promise<void> => {
  const command = await getCommand(
    body.callback_query?.message?.reply_to_message
  );
  if (command?.enabled) {
    await request(command, body);
  }

  return;
};

const executeCommand = async (body: UpdateTg): Promise<void> => {
  const command = await getCommand(body.message);
  if (command?.enabled) {
    await request(command, body);
  }

  return;
};

const executeExternal = async (body: UpdateTg): Promise<void> => {
  await CommandDao.initInstance();

  if (body?.message) {
    await executeCommand(body);
  }

  if (body?.callback_query) {
    await executeCallbackQuery(body);
  }

  return;
};

const saveUser = async (body: UpdateTg): Promise<void> => {
  try {
    await UserDao.initInstance();
    const { from } = body?.message ?? body?.callback_query ?? {};

    const user: User = {
      id: String(from?.id),
      username: from?.username ?? String(from?.id),
      firstname: from?.first_name,
      lastname: from?.last_name,
    };
    await UserDao.save(user);
  } finally {
    return;
  }
};

const execute = async (body: UpdateTg): Promise<{ statusCode: number }> => {
  if (body?.message?.from?.is_bot) {
    return { statusCode: NO_CONTENT };
  }

  await Promise.all([saveUser(body), executeExternal(body)]);

  return { statusCode: OK };
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
  if (STAGE === "dev") {
    console.log(`webhook message: \n${JSON.stringify(body, null, 2)} `);
  }
  const response = await execute(body);

  return callback(null, response);
};
