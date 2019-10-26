import { MongoClient, Db } from "mongodb";
import { isProd, logInfo } from "@utils/index";

const client = new MongoClient(process.env.DB_Endpoint!+'/'+process.env.DB_Name, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  replicaSet: process.env.DB_ReplicaSet,
  // connectWithNoPrimary: true,
  ...(isProd() && {
    auth: {
      user: process.env.DB_Name!,
      password: process.env.DB_Pwd!
    }
  })
});
let connection: MongoClient;
export default async function getDatabase(): Promise<Db> {
  if (connection) return connection.db();
  try {
    logInfo("database connecting...");
    // 多次调用connect时，控制台会打印一些 xx is not supported信息，相关so: https://stackoverflow.com/questions/54639778/why-am-i-getting-this-deprecated-warning-mongodb)
    connection = await client.connect();
    logInfo(`database connected to ${process.env.DB_Endpoint}`);
    return connection.db();
  } catch (e) {
    console.error("getDatabase error::::");
    console.error(e);
    process.exit(1);
    throw new Error("noop");
  }
}
