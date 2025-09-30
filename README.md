# Telegram Bot with Node.js, Express, and Gemini API

## 1. Project Overview

This project implements a sophisticated Telegram bot that leverages a relational database (MySQL) and Google's Gemini AI to answer natural language questions about the data stored in the database. The system is built on a Node.js runtime and uses an Express server to maintain a simple web presence.

The core functionality of the bot is to accept a user's question in plain text (e.g., "¿Cuántos clientes tenemos?"), translate it into a valid SQL query using the Gemini API, execute the query against the database, and then use Gemini again to summarize the results in a user-friendly, natural language format.

## 2. System Architecture

The system follows a straightforward, event-driven architecture:

1.  **Telegram Interface**: The user interacts with the bot through the Telegram app.
2.  **Node.js Application**: The main application, running in `index.js`, listens for incoming messages from the Telegram bot.
3.  **Express Server**: A minimal Express server is included to provide a basic HTTP endpoint and confirm that the application is running.
4.  **Gemini API Integration**:
    *   **Natural Language to SQL**: When a message is received, the bot sends the user's question along with the database schema to the Gemini API, which returns a corresponding SQL query.
    *   **Result Summarization**: After executing the SQL query, the bot sends the raw database results back to the Gemini API to generate a human-readable summary.
5.  **MySQL Database**: The database stores the application's data, organized into `clientes`, `productos`, and `ventas` tables.

## 3. Prerequisites

To run this project, you will need the following:

*   **Node.js**: v18.x or higher.
*   **MySQL**: A running instance of MySQL.
*   **Telegram Bot Token**: A valid token obtained from the BotFather on Telegram.
*   **Gemini API Key**: A valid API key from Google AI Studio.

## 4. Installation and Setup

### 4.1. Install Dependencies

Navigate to the project directory and install the required npm packages:

```bash
npm install
```

### 4.2. Database Setup

1.  Ensure your MySQL server is running.
2.  Create the database and tables by importing the `database.sql` file. You can do this using the following command, which will prompt you for your MySQL root password:

    ```bash
    mysql -u root -p < database.sql
    ```

### 4.3. Environment Variables

This project uses environment variables to handle sensitive information like API keys and tokens. **You must set these variables in your terminal session before running the application.**

```bash
export TELEGRAM_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**Note**: These variables are session-specific. If you close your terminal, you will need to set them again.

## 5. Running the Application

Once the setup is complete, you can start the application with the following command:

```bash
node index.js
```

The server will start, and the bot will begin polling for new messages on Telegram.

## 6. Code Structure

*   `index.js`: The main entry point of the application. It contains all the logic for the Express server, the Telegram bot, the database connection, and the integration with the Gemini API.
*   `database.sql`: The SQL script to create the `bot-telegram` database and the `clientes`, `productos`, and `ventas` tables, as well as insert initial sample data.
*   `package.json`: Defines the project's dependencies and metadata.

## 7. Key Functions and Logic

### `generarSQL(pregunta)`

This asynchronous function is responsible for converting a user's natural language question into a SQL query.

*   **Schema Context**: It includes a hardcoded database schema in the prompt. This is crucial for providing the Gemini model with the necessary context to generate accurate queries based on the available tables and columns.
*   **Prompt Engineering**: The prompt is carefully crafted to instruct the model to return only the SQL query and nothing else.
*   **Response Parsing**: The function includes logic to parse the response from Gemini, removing any Markdown formatting (e.g., ` ```sql...``` `) to ensure a clean SQL query is returned.

### `bot.on("message", ...)`

This is the main event handler for the bot. It triggers whenever a user sends a message.

1.  It receives the user's message (`pregunta`).
2.  It calls `generarSQL()` to get the SQL query.
3.  **Security Check**: It performs a crucial security validation to ensure that only `SELECT` queries are executed. Any other type of query (e.g., `UPDATE`, `DELETE`, `DROP`) is rejected, and an error message is sent to the user.
4.  It executes the SQL query against the database using the `mysql2/promise` library.
5.  It sends the database results to Gemini for summarization.
6.  **Text Cleaning**: Before sending the final response to the user, it cleans the text from Gemini to remove any lingering Markdown characters, ensuring a clean, plain-text output.
7.  It sends the final, summarized response to the user on Telegram.

## 8. Security Considerations

*   **Secrets Management**: All sensitive information (API keys and tokens) is managed through environment variables to avoid hardcoding them in the source code.
*   **SQL Injection Prevention**: While the model is instructed to generate safe queries, a defense-in-depth approach is taken by explicitly allowing only `SELECT` statements to be executed. This provides a strong safeguard against accidental or malicious database modifications.
