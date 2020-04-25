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
