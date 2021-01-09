# Archisaurus
A simple JSON-based local database for Deno

## Usage

### Import and initialization

    import { createDb } from "https://deno.land/x/archisaurus@v0.0.1/mod.ts";

    const myDb = createDb();

### Create db record

    const myItem = {
      id: "my_id",
      val: "my_value",
    };

    myDb.createRecord(myItem);

`id` property is required .

### Running your program

    deno run --unstable --allow-read --allow-write my_program.ts

### Define data model (optional)
*To-do*

### Read db record
*To-do*

### Update db record
*To-do*

### Destroy db record
*To-do*

### Delete database

#### with prompt for confirmation:

    myDb.dropDb();

#### Delete immediately:

    myDb.dropDb(true);

### Customization

    const myOptions = {
      dbDir: "my/nested/dir",
    };

    const customizedDb = createDb(myOptions);

##  Tests

    deno test --unstable --allow-read --allow-write https://deno.land/x/archisaurus@v0.0.1/test.ts

## Licence

MIT
