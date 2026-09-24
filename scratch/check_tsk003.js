import { connectToDatabase } from '../api/db.js';

async function run() {
  const { client, db } = await connectToDatabase();
  try {
    const task = await db.collection('intern_tasks').findOne({ $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] });
    console.log('Task TSK-003:', JSON.stringify({
      id: task?.id,
      taskId: task?.taskId,
      title: task?.title,
      status: task?.status,
      fileName: task?.fileName,
      fileSize: task?.fileSize,
      fileType: task?.fileType,
      hasFileData: Boolean(task?.fileData),
      fileDataLen: task?.fileData?.length,
      submissionUrl: task?.submissionUrl,
      submittedFilesKeys: task?.submittedFiles ? Object.keys(task.submittedFiles) : null,
      folder: task?.submittedFiles?.folder ? {
        name: task.submittedFiles.folder.name,
        size: task.submittedFiles.folder.size,
        type: task.submittedFiles.folder.type,
        hasData: Boolean(task.submittedFiles.folder.data),
        dataLen: task.submittedFiles.folder.data?.length,
        url: task.submittedFiles.folder.url
      } : null,
      video: task?.submittedFiles?.video ? {
        name: task.submittedFiles.video.name,
        size: task.submittedFiles.video.size,
        type: task.submittedFiles.video.type,
        hasData: Boolean(task.submittedFiles.video.data),
        dataLen: task.submittedFiles.video.data?.length,
        url: task.submittedFiles.video.url
      } : null,
      pdf: task?.submittedFiles?.pdf ? {
        name: task.submittedFiles.pdf.name,
        size: task.submittedFiles.pdf.size,
        hasData: Boolean(task.submittedFiles.pdf.data),
        dataLen: task.submittedFiles.pdf.data?.length
      } : null
    }, null, 2));

    const media = await db.collection('task_media').find({ $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] }).toArray();
    console.log('task_media count for TSK-003:', media.length);
    media.forEach(m => console.log('media item:', { assetType: m.assetType, fileName: m.fileName, chunkIndex: m.chunkIndex, totalChunks: m.totalChunks, size: m.chunkData?.length }));
  } finally {
    await client.close();
  }
}
run().catch(console.error);
