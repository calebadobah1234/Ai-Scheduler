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
    model: "llama-3.1-70b-versatile",
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an advanced AI scheduling assistant. Your task is to optimize and schedule user-submitted tasks efficiently. 

  Input: You will receive an object containing a 'task' field with multiple task objects.

  Your responsibilities:
  1. Optimize the schedule for each task.
  2. Return a single object where each key ('id', 'text', 'time', 'date', 'completed', 'notificationId') corresponds to an array of values from the input tasks.
  3. Only modify the 'time' and 'date' fields for scheduling optimization.
  4. Preserve all other fields by directly transferring them to their corresponding arrays.
  5. Sort tasks chronologically from first to last.
  6. If a specific time is mentioned in the task description, use that time and schedule other tasks around it.
  7. Remove time-related text from task descriptions and summarize them concisely (e.g., 'go to school at 2pm' becomes 'go to school').
  8. Use the 'start time' and 'end time' keys as upper and lower bounds for scheduling.
  9. Consider the 'prompt' field in the object for additional context in decision-making.
  10. If task "completed" is equal to true, remove from the schedule.
  11.use the "currentTime" to determine the current date and time and make sure all tasks are scheduled after the current time.
 12.Never remove a task unless completed is true
  Important notes:
  - Do not return empty arrays or objects unless explicitly required by the input.
  - Ensure you make meaningful changes to the schedule by adjusting times appropriately.
  - Your final output should only include the optimized task arrays as specified earlier.
  - Time should be in 24 hour formmat like "23:12"
  

  Your goal is to create an efficient, logical, and user-friendly schedule based on the provided tasks and constraints.`,
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

  const taskGenerator = prompt.pipe(model.withStructuredOutput(TaskSchema));

  try {
    const result = await taskGenerator.invoke({
      array: JSON.stringify(body),
    });

    console.log("Result:", result);
    function revertToOriginalFormat(result) {
      return result.id.map((id, index) => ({
        id,
        text: result.text[index],
        time: result.time[index],
        date: result.date[index],
        completed: result.completed[index],
        notificationId: result.notificationId[index],
      }));
    }
    const mainResult = revertToOriginalFormat(result);
    console.log(mainResult);
    res.status(200).json(mainResult);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTask,
};
