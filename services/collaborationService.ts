import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const runAgentCollaboration = async (reports: any) => {

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You are coordinating multiple doctors."
      },
      {
        role: "user",
        content: `
Multiple specialists analyzed a case.

${JSON.stringify(reports)}

Tasks:
- Resolve conflicts
- Combine insights
- Improve reasoning

Return improved combined JSON.
`
      }
    ]
  });

  return response.choices[0].message.content;
};