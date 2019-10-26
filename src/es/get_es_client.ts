import { Client } from "@elastic/elasticsearch";

let client: Client;
export default function getESClient(): Client {
  try {
    if (client) return client;
    client = new Client({
      node: process.env.ES_Endpoint
    });
    return client;
  } catch (e) {
    console.error("getESClient error::::");
    console.error(e);
    process.exit(1);
    throw new Error("noop")
  }
}
