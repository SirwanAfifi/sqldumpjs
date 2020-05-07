# MySQLDump.js

A tiny wrapper around `mysqldump` utility to generate a dump file of a MySQL database.

### Usage

Add a file called `.env` with the following keys (set values for the keys as well):

```
HOST=
PORT=3306
DATABASE_NAME=
DATABASE_USERNAME=root
DATABASE_PASSWORD=
```

Then run the script using `yarn start`.

### Dump all tables

```js
new MySQLDump({
  dbName: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
}).doBackup("outputFileName");
```

### Dump specific tables

```js
new MySQLDump({
  dbName: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  flags: {
    tables: ["customers", "orders"],
    compact: true,
  },
}).doBackup("outputFileName");
```

### Dump tables with where clause

```js
new MySQLDump({
  dbName: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  flags: {
    tables: [
      "customers",
      "orders",
      { table: "products", where: "product_id = 4" },
      { table: "shippers", where: "name = 'Hettinger LLC'" },
    ],
    compact: true,
  },
}).doBackup("outputFileName");
```

### Options

These are `mysqldump` options you can pass in to a `MySQLDump` instance.

| Option            |                              Description                              | Default |
| ----------------- | :-------------------------------------------------------------------: | ------: |
| `tables`          |                 The list of tables you want to export                 |    `[]` |
| `noData`          |                      Do not dump table contents                       | `false` |
| `where`           |           Dump only rows selected by given WHERE condition            | `false` |
| `compact`         |                      Produce more compact output                      | `false` |
| `addDropDatabase` |   Add DROP DATABASE statement before each CREATE DATABASE statement   | `false` |
| `addDropTable`    |      Add DROP TABLE statement before each CREATE TABLE statement      | `false` |
| `withRoutines`    | Dump stored routines (procedures and functions) from dumped databases | `false` |
