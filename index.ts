import { spawn, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Readable } from "stream";
import * as chalk from "chalk";

dotenv.config();

const FlagsMap: Map<Partial<keyof MySQLDumpOptionsFlags>, string> = new Map<
  Partial<keyof MySQLDumpOptionsFlags>,
  string
>([
  ["noData", "--no-data"],
  ["where", "-w"],
  ["compact", "--compact"],
  ["addDropDatabase", "--add-drop-database"],
  ["addDropTable", "--add-drop-table"],
]);

interface MySQLDumpOptions {
  host?: string;
  port?: number;
  dbName: string;
  user?: string;
  password: string;
  flags?: MySQLDumpOptionsFlags;
}

interface MySQLDumpOptionsFlagsTable {
  table: string;
  where?: string;
}

interface MySQLDumpOptionsFlags {
  tables: (string | MySQLDumpOptionsFlagsTable)[];
  noData?: boolean;
  where?: string;
  compact?: boolean;
  addDropDatabase?: boolean;
  addDropTable?: boolean;
}

export class MySQLDump {
  constructor(
    public options: MySQLDumpOptions = {
      ...options,
      host: "localhost",
      port: 3306,
      user: "root",
    }
  ) {}

  async doBackup(saveAs: string) {
    if (!this.options.dbName || !this.options.password) {
      return new Error("Please set database name, password");
    }

    const MYSQL_DUMP = "mysqldump";
    let commands: any = [
      "-u",
      this.options.user,
      "-p" + this.options.password,
      this.options.dbName,
      `TABLE`,
      `TABLEOBJ`,
      ...Object.entries(this.options.flags)
        .filter(([key]) => key !== "tables")
        .map(([key, value]) => (value ? FlagsMap.get(key as any) : ""))
        .filter((item) => item),
    ].filter((item) => item);

    const tableStrings = [];
    const tableObjects = [];
    this.options.flags.tables.forEach((t) => {
      if (typeof t === "string") {
        tableStrings.push(t);
      } else if (typeof t !== "string" && !t.where) {
        tableStrings.push(t.table);
      } else {
        tableObjects.push(t);
      }
    });

    const tableStringsCommand = this.replaceItem(
      "TABLE",
      commands,
      tableStrings
    ).filter(this.removeExtraFields);

    const spawnArray = [];

    if (tableStrings.length > 0) {
      spawnArray.push(
        this.spawnAsPromised(spawn(MYSQL_DUMP, [...tableStringsCommand]))
      );
    }

    tableObjects.forEach((tableObject) => {
      const newCommand = this.replaceItem("TABLEOBJ", commands, [
        tableObject.table,
        FlagsMap.get("where"),
        `${tableObject.where}`,
      ]).filter(this.removeExtraFields);
      spawnArray.push(this.spawnAsPromised(spawn(MYSQL_DUMP, [...newCommand])));
    });

    const dbDump = Promise.all(spawnArray);
    let result = await dbDump;
    const fullPath = path.join(__dirname, "dump");
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    const fileName = `${saveAs}.sql`;
    const wstream = fs.createWriteStream(`${fullPath}/${saveAs}.sql`);
    return new Promise((resolve, reject) => {
      const readable = Readable.from(result);
      readable.pipe(wstream);

      wstream.on("finish", () => resolve(`/dump/${fileName}`));
      wstream.on("error", reject);
    });
  }

  private spawnAsPromised(childProcess: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let stdout = "",
        stderr = "";
      childProcess.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      childProcess.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
      childProcess.on("error", reject).on("close", (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(stderr);
        }
      });
    });
  }

  private replaceItem(item, array, newArray) {
    const itemIndex = array.indexOf(item);
    return (
      [...array.slice(0, itemIndex), ...array.slice(itemIndex), ...newArray] ||
      []
    );
  }

  private removeExtraFields = (item) => item !== "TABLE" && item !== "TABLEOBJ";
}

new MySQLDump({
  dbName: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  flags: {
    tables: [
      "Users",
      "Role",
      { table: "Field", where: "FieldID = 4" },
      { table: "Role", where: "Name = 'Manager'" },
      { table: "Farm", where: "FarmID = 3 OR FarmID = 4" },
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
