import OpenAI from "openai";
const openai = new OpenAI();

export const getJobTitles = async (html) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You will receive a string of html from a job board. Respond with the job titles listed in the html.",
      },
      { role: "user", content: html },
    ],
  });

  console.log(response);

  return response.choices[0].message;
};
