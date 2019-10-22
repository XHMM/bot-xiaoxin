import { Client } from "@elastic/elasticsearch";
import { ES_Endpoint } from '@constants/constants';

let client: Client;
export default function getESClient(): Client {
  try {
    if (client) return client;
    client = new Client({
      node: ES_Endpoint
    });
    return client;
  } catch (e) {
    console.error("getESClient error::::");
    console.error(e);
    process.exit(1);
    throw new Error("noop")
  }
}
