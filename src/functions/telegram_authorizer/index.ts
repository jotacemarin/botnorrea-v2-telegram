import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { UserDao } from "../../lib/dao/userDao";

enum Effect {
  DENY = "Deny",
  ALLOW = "Allow",
}

const buildPolicy = (
  Resource: string,
  Effect: Effect
): APIGatewayAuthorizerResult => ({
  principalId: "user",
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Resource,
        Effect,
      },
    ],
  },
  context: {
    "Botnorrea-v2": true,
  },
});

const extractToken = (authorizationToken: string) => {
  const [_, token] = authorizationToken?.split(" ");
  const cleanToken = atob(token);
  const [clientId, clientSecret] = cleanToken?.split(":");
  console.log("extractToken", `${clientId}, ${clientSecret}`);
  return { clientId, clientSecret };
};

const login = async (
  clientId: string,
  clientSecret: string
): Promise<Effect> => {
  try {
    await UserDao.initInstance();
    const user = await UserDao.findByKey(clientId, clientSecret);
    return Boolean(user) ? Effect.ALLOW : Effect.DENY;
  } catch (error) {
    return Effect.DENY;
  }
};

export const telegramAuthorizer = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  if (!event?.authorizationToken) {
    return buildPolicy(event.methodArn, Effect.DENY);
  }

  const { clientId, clientSecret } = extractToken(event.authorizationToken);
  const effect = await login(clientId, clientSecret);
  return buildPolicy(event.methodArn, effect);
};
