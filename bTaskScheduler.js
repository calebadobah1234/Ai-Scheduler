const { ChatGroq } = require("@langchain/groq");
const { z } = require("zod");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");

const getTask = async (req, res) => {
  const body = req.body;
  console.log("Request body:", body);

  const model = new ChatGroq({
    apiKey: "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",
    model: "llama3-70b-8192",
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful AI assistant. You will receive an array of task objects submitted by a user. Your job is to take each task and optimally schedule it. You should then return a single object where each key (e.g., 'id', 'text', 'time', 'date', 'completed', 'notificationId') corresponds to an array of all the values for that field from the input tasks. Make sure to only modify the 'time' and 'date' fields for optimal scheduling. All other fields should be directly transferred into their corresponding arrays. Do not return empty arrays or objects unless explicitly required by the input.And also sort them from first task to do to last. Make sure you really schedule by changing the time. If the time is stated in the prompt use that time. don't modify it. and make the rest of the schedule around it.`,
    ],
    ["human", "{array}"],
  ]);

  const TaskSchema = z.object({
    id: z.array(z.string()).describe("IDs of all tasks"),
    text: z.array(z.string()).describe("Text of all tasks"),
    time: z.array(z.string()).describe("Times of all tasks"),
    date: z.array(z.string()).describe("Dates of all tasks"),
    completed: z.array(z.boolean()).describe("Completion status of all tasks"),
    notificationId: z
      .array(z.string())
      .describe("Notification IDs of all tasks"),
  });

  const ScheduledTasksSchema = z.array(TaskSchema);

  const taskGenerator = prompt.pipe(model.withStructuredOutput(TaskSchema));

  try {
    const result = await taskGenerator.invoke({
      array: JSON.stringify(body),
    });

    console.log("Result:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTask,
};
