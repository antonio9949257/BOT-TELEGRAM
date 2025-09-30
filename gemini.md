# Gemini API Integration Technical Documentation

## 1. Overview of Gemini Integration

This system leverages the Google Gemini API for two primary, sophisticated tasks that form the core of the bot's intelligence:

1.  **Natural Language to SQL Conversion**: Translating a user's question in plain text into a valid, executable MySQL query.
2.  **Database Result Summarization**: Condensing the structured data returned from the database into a human-readable, natural language summary.

This documentation provides a detailed technical breakdown of how the Gemini API is integrated and utilized.

## 2. Model Configuration

*   **Model Used**: The system is configured to use the `gemini-2.5-flash` model. This choice was made based on user preference for a recent model.

    ```javascript
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    ```

*   **Note on Model Availability**: The availability of specific Gemini models can vary based on the API key's access rights and the region. If `gemini-2.5-flash` is not available, a `404 Not Found` error will occur. In such cases, it is recommended to switch to a more generally available model like `gemini-pro`.

## 3. Core Use Case: Natural Language to SQL

### 3.1. Function: `generarSQL(pregunta)`

This function is the heart of the bot's query generation capability. It takes a user's question as input and returns a string containing the corresponding SQL query.

### 3.2. Prompt Engineering

The success of this feature hinges on effective prompt engineering. The prompt sent to the Gemini API is carefully constructed to provide the necessary context and constraints.

**Full Prompt Structure:**

```
  Tablas y columnas disponibles en la base de datos:
  - clientes(id, nombre, email)
  - productos(id, nombre, precio)
  - ventas(id, cliente_id, producto_id, cantidad, fecha)
  

  Convierte la siguiente pregunta del usuario en una consulta SQL válida para MySQL.
  La consulta debe basarse SOLO en las tablas y columnas listadas arriba.
  SOLO devuélveme la consulta SQL, nada más.

  Pregunta: "<user_question>"
```

**Key Elements of the Prompt:**

*   **Schema Definition**: The prompt begins by explicitly defining the database schema. This is the most critical piece of context, as it informs the model about the available tables and columns, preventing it from "hallucinating" non-existent fields.
*   **Clear Instructions**: The prompt gives a clear, direct instruction to convert the user's question into a valid MySQL query.
*   **Constraints**: It includes two important constraints:
    1.  `La consulta debe basarse SOLO en las tablas y columnas listadas arriba.` (The query must be based ONLY on the tables and columns listed above.)
    2.  `SOLO devuélveme la consulta SQL, nada más.` (ONLY return the SQL query, nothing else.) This is intended to minimize conversational boilerplate in the response.

### 3.3. Response Processing

Even with clear instructions, the Gemini model may wrap its response in a Markdown code block for readability. The `generarSQL` function handles this by using a regular expression to parse the response and extract only the pure SQL query:

```javascript
const sqlMatch = rawSql.match(/```sql\n([\s\S]*?)\n```/);
return sqlMatch ? sqlMatch[1] : rawSql;
```

## 4. Core Use Case: Database Result Summarization

### 4.1. Logic

After a SQL query is successfully executed, the raw results (an array of JSON objects) are sent back to the Gemini API for summarization.

### 4.2. Prompt Engineering

The prompt for this task is designed to convert structured data into a natural language summary.

**Full Prompt Structure:**

```
      Pregunta: <user_question>
      Resultados de la consulta: <json_results>
      Resume los resultados en un lenguaje natural, breve y claro.
```

**Key Elements of the Prompt:**

*   **Original Question**: Including the user's original question provides context for the summarization.
*   **Database Results**: The `JSON.stringify()` of the database rows is passed directly to the model.
*   **Instruction**: A clear instruction is given to summarize the results in a brief and clear natural language.

### 4.3. Text Cleaning

To ensure a clean output, any lingering Markdown characters (like `*`) are removed from the final summary before it is sent to the user:

```javascript
const textoLimpio = textoResumen.replace(/\*+/g, "");
bot.sendMessage(chatId, textoLimpio);
```

## 5. API Key Management

Security is paramount when dealing with API keys. The `GEMINI_API_KEY` is managed exclusively through an environment variable. This prevents the key from being hardcoded in the source code and accidentally exposed in version control.

```javascript
const GEMINI_KEY = process.env.GEMINI_API_KEY;
```

