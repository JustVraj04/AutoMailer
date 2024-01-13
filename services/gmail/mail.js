import { gmail } from "@googleapis/gmail";
import GoogleOAuthServices from "../googleAuth/oauth2.js";

class GMail {
  static gmailClient = gmail({
    version: "v1",
    auth: GoogleOAuthServices.oauth2Client,
  });

  static oauth2Client = GoogleOAuthServices.oauth2Client;

  // Function to get all the unread threads
  static getEmailThreads = async (refreshToken) => {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const foundThreads = await this.gmailClient.users.threads.list({
      auth: this.oauth2Client,
      userId: "me",
      labelIds: ["INBOX"],
      q: "is:unread",
    });

    return foundThreads.data.threads || [];
  };

  // Function to get the thread details
  static GetThreadDetails = async (threadId, refreshToken) => {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const foundThreadDetails = await this.gmailClient.users.threads.get({
      auth: this.oauth2Client,
      userId: "me",
      id: threadId,
    });

    return foundThreadDetails.data;
  };

  // Function to check if the email has been replied to
  static CheckIfRespoded = (thread, emailId) => {
    return thread.messages?.some((message) =>
      message.payload?.headers?.some(
        (header) =>
          header.name?.toLowerCase() === "from" &&
          header.value?.toLowerCase().includes(emailId)
      )
    );
  };

  // Function to get the email sender
  static GetEmailSender = (thread) => {
    if (!thread.messages) return null;

    return thread.messages[0].payload?.headers?.find(
      (header) => header.name?.toLowerCase() === "from"
    )?.value;
  };

  // Function to get the thread subject
  static GetThreadSubject = (thread) => {
    if (!thread.messages) return null;

    return thread.messages[0].payload?.headers?.find(
      (header) => header.name?.toLowerCase() === "subject"
    )?.value;
  };

  // Function to send the reply to the thread
  static SendReplyToThread = async (senderEmailId, thread, refreshToken) => {
    if (!thread.messages) {
      console.log("Empty thread provided");
      return;
    }

    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const threadId = thread.id;
    const replyMessage = {
      raw: Buffer.from(
        `From: ${senderEmailId}\n` +
          `To: ${this.GetEmailSender(thread)}\n` +
          `Subject: ${this.GetThreadSubject(thread)}\n` +
          `In-Reply-To: ${threadId}\n` +
          `References: ${threadId}\n\n` +
          `Thank you for mail.I am unable to reach out to you as I am on vacation. I will get back to you as soon as possible.`
      ).toString("base64"),
    };

    await this.gmailClient.users.messages.send({
      auth: this.oauth2Client,
      userId: "me",
      requestBody: { ...replyMessage, threadId },
    });
  };

  // Function to get the label details
  static getLabelDetails = async (lableName, refreshToken) => {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const labelsRes = await this.gmailClient.users.labels.list({
      userId: "me",
      auth: this.oauth2Client,
    });

    const labels = labelsRes.data.labels || [];

    let label = labels.find(
      (label) =>
        label.name?.toLocaleLowerCase() === lableName.toLocaleLowerCase()
    );

    return label;
  };

  // Function to create the label
  static createLabel = async (labelName, refreshToken) => {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const createdLable = await this.gmailClient.users.labels.create({
      auth: this.oauth2Client,
      userId: "me",
      requestBody: {
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
        name: labelName,
      },
    });

    return createdLable.data;
  };

  // Function to set the thread label
  static setThreadLabel = async (label, thread, refreshToken) => {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    if (!thread.messages) {
      console.log("empty thread is provided");
      return;
    }

    const threadId = thread.id;

    if (!threadId) {
      console.log("thead not found");
      return;
    }

    await this.gmailClient.users.threads.modify({
      auth: this.oauth2Client,
      userId: "me",
      id: threadId,
      requestBody: {
        addLabelIds: [label.id || ""],
      },
    });
  };
}

export default GMail;
