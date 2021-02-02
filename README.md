# Archisaurus

A simple JSON-based local database for Deno

## Usage

### Import and initialization

    import { createDb } from "https://deno.land/x/archisaurus@v0.0.2/mod.ts";

    const myDb = createDb();

### Create db record

    const myItem = {
      id: "my_id",
      val: "my_value",
    };

    myDb.createRecord(myItem);

`id` property is required.

### Running your program

    deno run --unstable --allow-read --allow-write my_program.ts

### Define data model (optional)

_To-do_

### Read db record

_To-do_

### Update db record

_To-do_

### Destroy db record

_To-do_

### Delete database

#### with prompt for confirmation:

    myDb.dropDb();

#### or delete immediately:

    myDb.dropDb(true);

### Customization

    const myOptions = {
      dbDir: "my/nested/dir",
      pretty: 4, // saves db file in pretty format, number of spaces to indent
    };

    const customizedDb = createDb(myOptions);

## Tests

    deno test --unstable --allow-read --allow-write https://deno.land/x/archisaurus@v0.0.2/test.ts

## Licence

MIT
