import axios, { AxiosResponse, AxiosInstance } from "axios";

const { AUTH_URL } = process.env;

interface Auth0GetTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class AuthService {
  private static instance: AxiosInstance;

  private constructor() {}

  public static initInstance(): void {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: `${AUTH_URL}`,
      });
    }
  }

  public static getToken(
    clientId: string | number,
    clientSecret: string | number
  ): Promise<AxiosResponse<Auth0GetTokenResponse>> {
    return AuthService.instance.post("/oauth/token", {
      client_id: clientId,
      client_secret: clientSecret,
      audience: "botnorrea-v2",
      grant_type: "client_credentials",
    });
  }
}
