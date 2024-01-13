import Gmail from "../gmail/mail.js";
import GoogleOAuthServices from "../googleAuth/oauth2.js";
import Redis from "../../redis.js";
class AutoReply {
  // Function to check if there are any users in the database
  static check = async () => {
    const users = await GoogleOAuthServices.getTokenFromDB();
    if (users.length === 0) {
      console.log(
        "No users found. Waiting for 10 seconds before checking again."
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return await this.check(); // Recursive call to check again
    }

    return users;
  };

  static autoReplyForAll = async () => {
    // Function should do the following:
    // 1. Get all the users from the database
    // 2. For each user, start the auto reply service simultaneously
    // 3. If there are no users, log a message

    console.log("Starting auto reply for all users");

    const users = await this.check();

    const autoReplyPromises = users.map((user) => {
      this.autoReplyService(
        { refreshToken: user.refresh_token, email: user.email },
        {
          minInterval: 45,
          maxInterval: 120,
          labelName: "AutoReply",
        }
      );
    });

    await Promise.all(autoReplyPromises);
    console.log("Done auto reply for all users");
  };

  // Function to start the auto reply service for a user
  static autoReplyService = async (accountDetails, config) => {
    console.log(
      `   [${accountDetails?.email}] : Auto reply service started...`
    );

    // Generate a random delay between minInterval and maxInterval
    const delay =
      Math.floor(
        Math.random() * (config.maxInterval - config.minInterval + 1) +
          config.minInterval
      ) * 1000;

    console.log(
      `   [${accountDetails?.email}] : interval = ${delay / 1000} sec`
    );

    const { refreshToken, email } = accountDetails;

    if (!email) {
      console.log(
        `   [${accountDetails?.email}] : [skip] User email not found!`
      );
      return;
    }

    try {
      // check if lables exists, if not create one
      console.log(
        `   [${accountDetails?.email}] : checking label availability`
      );
      let label = await Gmail.getLabelDetails(config.labelName, refreshToken);

      if (!label) {
        console.log(`   [${accountDetails?.email}] : label not found!`);
        console.log(`   [${accountDetails?.email}] : creating label`);
        label = await Gmail.createLabel(config.labelName, refreshToken);
      }

      // start auto reply
      while (true) {
        await this.replyingToEmails(email, refreshToken, label, config);
        console.log(`   [${accountDetails?.email}] : done!\n\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (err) {
      console.log(`: Auto Reply Service <${accountDetails.email}>\n`, err);
    }
  };

  // Function to reply to emails
  static async replyingToEmails(emailId, refreshToken, labelDetails, config) {
    console.log(`       [${emailId}] :Reading email threads`);

    const threads = await Gmail.getEmailThreads(refreshToken);
    console.log(`       [${emailId}] :Threads found: ${threads.length}`);

    const replyActionPromises = threads.map(async (thread) => {
      if (!thread.id) return false;

      console.log(
        `       [${emailId}] :[Thread ${thread.id}] Getting messages`
      );
      const threadDetails = await Gmail.GetThreadDetails(
        thread.id,
        refreshToken
      );

      const threadLabels = threadDetails.messages
        ? threadDetails.messages[0]?.labelIds
        : [];

      if (threadLabels?.includes(config.labelName)) {
        console.log(
          `       [${emailId}] :[Thread ${thread.id}] Already replied! Skipping!`
        );
        return false;
      }

      console.log(
        `       [${emailId}] :[Thread ${thread.id}] Checking prior response`
      );
      const hasPriorReplies = Gmail.CheckIfRespoded(
        threadDetails,
        emailId || ""
      );

      if (!hasPriorReplies) {
        console.log(`       [${emailId}] :[Thread ${thread.id}] Sending reply`);
        await Gmail.SendReplyToThread(
          emailId || "",
          threadDetails,
          refreshToken
        );

        console.log(`       [${emailId}] :[Thread ${thread.id}] Adding label`);

        if (!labelDetails) return false;
        await Gmail.setThreadLabel(labelDetails, threadDetails, refreshToken);

        return true;
      }

      return false;
    });

    await Promise.all(replyActionPromises);
  }
}

export default AutoReply;
