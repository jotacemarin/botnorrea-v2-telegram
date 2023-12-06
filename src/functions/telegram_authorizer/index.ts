import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { AuthService } from "../../lib/services/auth";

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
  return { clientId, clientSecret };
};

const loginToAuth0 = async (
  clientId: string | number,
  clientSecret: string | number
): Promise<Effect> => {
  try {
    AuthService.initInstance();
    await AuthService.getToken(clientId, clientSecret);
    return Effect.ALLOW;
  } catch (error) {
    console.log(`${Effect.DENY}: ${error.message}`, error);
    return Effect.ALLOW;
  }
};

export const telegramAuthorizer = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  if (!event?.authorizationToken) {
    console.log(`Effect: ${Effect.DENY}`);
    return buildPolicy(event.methodArn, Effect.DENY);
  }

  const { clientId, clientSecret } = extractToken(event.authorizationToken);
  const effect = await loginToAuth0(clientId, clientSecret);
  console.log(`Effect: ${effect}`);
  return buildPolicy(event.methodArn, effect);
};
