const fs = require("fs").promises;

const MSG_FILE_PATH = "/mnt/msg/content";

exports.handler = async function (event) {
  console.log("start lambda function");

  const method = event.requestContext.http.method;

  if (method === "GET") {
    return sendRes(200, await getMessages());
  } else if (method === "POST") {
    const newMessage = event.body;
    await addNewMessage(newMessage);
    return sendRes(200, await getMessages());
  } else if (method === "DELETE") {
    await deleteAllMessages();
    return sendRes(200, "All messages deleted");
  } else {
    return sendRes(200, "Method unsupported");
  }
};

const addNewMessage = async (message) => {
  try {
    await fs.appendFile(MSG_FILE_PATH, message + "\n");
  } catch (error) {
    console.log(error);
  }
};

const getMessages = async () => {
  try {
    return await fs.readFile(MSG_FILE_PATH, "utf8");
  } catch (error) {
    console.log(error);
  }
};

const deleteAllMessages = async () => {
  console.log("delete all messages");
  try {
    await fs.unlink(MSG_FILE_PATH);
  } catch (error) {
    console.log(error);
  }
};

const sendRes = (status, body) => {
  var response = {
    statusCode: status,
    body: body,
  };
  return response;
};
