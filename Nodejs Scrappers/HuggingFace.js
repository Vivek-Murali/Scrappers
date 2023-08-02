//import fetch from "node-fetch";
const fetch = require("node-fetch");
const API_TOKEN = "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";
async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
        {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}
query("generate single line code to sort a list in JS").then((response) => {
    console.log(JSON.stringify(response));
});