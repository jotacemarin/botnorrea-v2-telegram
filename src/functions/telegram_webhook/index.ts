import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST, NO_CONTENT } from "http-status";
import axios from "axios";
import { getTextCommand } from "../../lib/utils/telegramHelper";
import { Command, UpdateTg, User, FormattingOptionsTg } from "../../lib/models";
import { CommandDao, UserDao } from "../../lib/dao";
import { TelegramService } from "../../lib/services";

const { STAGE } = process.env;

const getCommand = async (body: UpdateTg): Promise<Command | null> => {
  if (!body) {
    return null;
  }

  const key = getTextCommand(body);
  if (!key) {
    return null;
  }

  return CommandDao.findByKey(key);
};

const request = async (command: Command, body: UpdateTg) => {
  try {
    console.log(`${command.key}: ${command.url}`);
    await axios.post(command.url, body);
  } catch (error) {
    await TelegramService.sendMessage({
      chat_id: body.message!.chat.id,
      reply_to_message_id: body?.message?.message_id,
      parse_mode: FormattingOptionsTg.HTML,
      text: `🫤 <code>${error?.message}</code>`,
    });
  } finally {
    return;
  }
};

const executeCallbackQuery = async (body: UpdateTg): Promise<void> => {
  const command = await getCommand({
    update_id: 0,
    message: body.callback_query?.message?.reply_to_message,
  });
  if (command?.enabled) {
    await request(command, body);
  }

  return;
};

const executeCommand = async (body: UpdateTg): Promise<void> => {
  const command = await getCommand(body);
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
  const startDate = new Date();

  if (!event?.body) {
    return callback(null, { statusCode: BAD_REQUEST });
  }

  const body = JSON.parse(event?.body);
  if (STAGE === "dev") {
    console.log(`webhook message: \n${JSON.stringify(body, null, 2)} `);
  }
  const response = await execute(body);

  const endDate = new Date();
  console.log(
    `Telegram Webhook execution: ${endDate.getTime() - startDate.getTime()}ms`
  );

  return callback(null, response);
};
