<p align="center">
  <img src="https://i.imgur.com/zKyApED.jpg" style="border-radius: 50%" height="280px">
  <p align="center">Telegram core for botnorrea<p>
</p>

## Botnorrea v2 telegram dependencies

- nodejs `18.19.0`
- serverles framework `3`
- @aws-sdk/client-dynamodb `3.388.0`
- @aws-sdk/lib-dynamodb `3.388.0`
- @xenova/transformers `2.8.0`
- axios `1.4.0`
- dayjs `1.11.10`
- http-status `1.6.2`
- mongoose `8.0.0`

## How to install

```sh
npm install
```

## How to setup

You can copy the file `config/dev_mock.json`, fill with your credentials and required data and rename to `dev.json` or `prod.json` according to your requirements, here the short explanation about environment variables

- `BOT_USERNAME`: bot name
- `TELEGRAM_BOT_TOKEN`: telegram bot token given by Bot Father
- `AUTH_URL`: your auth0 url from auth0
- `MONGO_USER`: mongo database user
- `MONGO_PASSWORD`: mongo database password
- `MONGO_HOST`: mongo database host
- `MONGO_DATABASE`: mongo database database

## How to test local

```sh
npm run local:telegramWebhook
```

## Scripts available to test lambdas locally

- local:telegramAuthorizer
- local:telegramSetWebhook
- local:telegramWebhook
- local:telegramWebhookCallback
- local:telegramSendMessage
- local:telegramSendPhoto
- local:telegramSendVideo
- local:telegramDebug
- local:telegramGetChats
- local:telegramCleanReplyMarkup
- local:telegramMembersMute
- local:telegramMembersUnmute

## How to deploy

- `dev:deploy`: deploy lambdas to development environment
- `dev:destroy`: deploy all lambdas resources from development environment
- `prod:deploy`: deploy lambdas to production environment
- `prod:destroy`: deploy all lambdas resources from production environment

## Endpoints available

- `/telegram/set-webhook`
  - method: `POST`
  - body: `application/json`
    ```typescript
    {
      url: string;
    }
    ```
- `/telegram/webhook`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface UpdateTg {
      update_id: number;
      message?: MessageTg;
      callback_query?: {
        id: string;
        from: UserTg;
        message: MessageTg;
        chat_instance: string;
        data: string;
      };
    }
    ```
- `/telegram/send-message`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface SendMessageParams {
      chat_id: number | string;
      text: string;
      message_thread_id?: number;
      parse_mode?: FormattingOptionsTg;
      entities?: Array<EntityTg>;
      protect_content?: boolean;
      reply_to_message_id?: number;
      reply_markup?: {
        inline_keyboard: Array<any>;
      };
      has_spoiler?: boolean;
    }
    ```
- `/telegram/edit-message`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface EditMessageParams {
      chat_id: number | string;
      message_id: number | string;
      text: string;
      message_thread_id?: number;
      parse_mode?: FormattingOptionsTg;
      entities?: Array<EntityTg>;
      protect_content?: boolean;
      reply_to_message_id?: number;
      reply_markup?: {
        inline_keyboard: Array<any>;
      };
      has_spoiler?: boolean;
    }
    ```
- `/telegram/send-photo`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface SendPhotoParams {
      chat_id: number | string;
      photo: string;
      caption?: string;
      parse_mode?: FormattingOptionsTg;
      caption_entities?: Array<EntityTg>;
      reply_to_message_id?: number;
      allow_sending_without_reply?: boolean;
      protect_content?: boolean;
      reply_markup?: {
        inline_keyboard: Array<any>;
      };
      has_spoiler?: boolean;
    }
    ```
- `/telegram/send-video`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface SendVideoParams {
      chat_id: number | string;
      video: string;
      caption?: string;
      parse_mode?: FormattingOptionsTg;
      caption_entities?: Array<EntityTg>;
      reply_to_message_id?: number;
      allow_sending_without_reply?: boolean;
      protect_content?: boolean;
      reply_markup?: {
        inline_keyboard: Array<any>;
      };
      has_spoiler?: boolean;
    }
    ```
- `/telegram/debug`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface UpdateTg {
      update_id: number;
      message?: MessageTg;
      callback_query?: {
        id: string;
        from: UserTg;
        message: MessageTg;
        chat_instance: string;
        data: string;
      };
    }
    ```
- `/telegram/get-chats`
  - method: `POST`
  - body: `application/json`
    ```typescript
    {
      user: number | string;
      chats: Array<number | string>;
    }
    ```
- `/telegram/clean-reply-markup`
  - method: `POST`
  - body: `application/json`
    ```typescript
    {
      chatId: number | string;
      messageId: number | string;
    }
    ```
- `/telegram/members/mute`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface UpdateTg {
      update_id: number;
      message?: MessageTg;
      callback_query?: {
        id: string;
        from: UserTg;
        message: MessageTg;
        chat_instance: string;
        data: string;
      };
    }
    ```
- `/telegram/members/unmute`
  - method: `POST`
  - body: `application/json`
    ```typescript
    interface UpdateTg {
      update_id: number;
      message?: MessageTg;
      callback_query?: {
        id: string;
        from: UserTg;
        message: MessageTg;
        chat_instance: string;
        data: string;
      };
    }
    ```

## How commands are stored in mongodatabae

```json
{
  "key": "/debug",
  "createdAt": {
    "$date": "2023-11-12T20:00:17.543Z"
  },
  "enabled": true,
  "updatedAt": {
    "$date": "2023-11-12T20:00:17.543Z"
  },
  "url": ""
}
```
