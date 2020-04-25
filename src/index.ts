import { MySQLDump } from "../lib";
import * as chalk from "chalk";

new MySQLDump({
  dbName: process.env.DATABASE_NAME || "dbName",
  password: process.env.DATABASE_PASSWORD || "pwd",
  flags: {
    tables: [
      "customers",
      "orders",
      { table: "products", where: "product_id = 4" },
      { table: "shippers", where: "name = 'Hettinger LLC'" },
    ],
    compact: true,
  },
})
  .doBackup("dump")
  .catch((error: string) =>
    console.log(chalk.bold.hex("#C90F5E")(`\n\t${error}`))
  )
  .then(() =>
    console.log(
      chalk.bold.hex("#53AE15")(`\n\t${new Date().toTimeString()}\tDone\n`)
    )
  );
