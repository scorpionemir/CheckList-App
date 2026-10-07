import {
    testLocalDatabase,
} from "./localDatabase";

export const runDatabaseTest = async () => {
    try {
        const tables =
            await testLocalDatabase();

        console.log(
            "SQLite tables:",
            tables
        );

        return tables;
    } catch (error) {
        console.error(
            "SQLite test failed:",
            error
        );

        throw error;
    }
};