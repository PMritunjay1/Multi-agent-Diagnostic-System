import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const detectMedicalIntent = async (structuredCase: any) => {

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You classify medical intent."
      },
      {
        role: "user",
        content: `
Analyze the case and detect intent.

Case:
${JSON.stringify(structuredCase)}

Return JSON:
{
  "primaryIntent": "",
  "secondaryIntents": []
}
`
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content!);
};