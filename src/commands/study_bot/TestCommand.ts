/*
const { result: isFileMsg, file: msgFile, path: msgPath } = isFileMessage(message);
if (isAdmin && isFileMsg) {
  ret.command = TestCommand.人脸识别;
  ret.data = {
    file: msgFile,
    path: msgPath,
  };
}

const testCommandHandlers: CommandHandlersMap<typeof TestCommand> = {
  [TestCommand.人脸识别]: async (_req, res, {file, path}) => {
    const localPath = await studyBotHttpPluginAPI.downloadImage(file);
    console.log(file, path);
    console.log(localPath);
    res.end();
  }
}
*/
