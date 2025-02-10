export interface rmqConfig {
  hostname: string;
  username: string;
  password: string;
  vhost: string;
  protocol?: string;
  port?: number;
  ca?: any;
  cert?: any;
  key?: any;
  rejectUnauthorized?: boolean;
}