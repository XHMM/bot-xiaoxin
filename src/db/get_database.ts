import { MongoClient, Db } from "mongodb";
import { isProd, logInfo } from "@utils/index";
import { Database_Endpoint, DB_Auth } from '@constants/constants';

const client = new MongoClient(Database_Endpoint, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // connectWithNoPrimary: true,
  ...(isProd() && {
    auth: DB_Auth
  })
});
let connection: MongoClient;
export default async function getDatabase(): Promise<Db> {
  if (connection) return connection.db();
  try {
    logInfo("database connecting...");
    // 多次调用connect时，控制台会打印一些 xx is not supported信息，相关so: https://stackoverflow.com/questions/54639778/why-am-i-getting-this-deprecated-warning-mongodb)
    connection = await client.connect();
    logInfo(`database connected to ${Database_Endpoint}`);
    return connection.db();
  } catch (e) {
    console.error("getDatabase error::::");
    console.error(e);
    process.exit(1);
    throw new Error("noop");
  }
}
