const sqlite3 = require('sqlite3').verbose();

const database = new sqlite3.Database("./test.db");

const CreatePeopleTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS people (
        id text PRIMARY KEY,
        name text,
        age int)`;

    return database.run(query);
}

const CreatePostTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS posts (
        id text PRIMARY KEY,
        title text,
        authorID text)`;
    return database.run(query);
}

module.exports = {
    CreatePeopleTable,
    CreatePostTable,
    database
}