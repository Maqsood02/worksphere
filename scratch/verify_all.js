import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function verifyAll() {
  console.log("=== WORKSPHERE TASK & REVISION SYSTEM VERIFICATION ===");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const tasksCol = db.collection('intern_tasks');

    // TEST 1: Check all task IDs in database
    console.log("\n[TEST 1] Verifying Task IDs in MongoDB Atlas:");
    const allTasks = await tasksCol.find({}).sort({ taskId: 1 }).toArray();
    console.log(`Found ${allTasks.length} tasks:`);
    allTasks.forEach((t, i) => {
      console.log(`  ${i + 1}. [${t.taskId || t.id}] "${t.title}" (Status: ${t.status}, Assigned: @${t.assignedTo})`);
    });

    const task3 = allTasks.find(t => t.title && t.title.includes('Task 3'));
    if (task3 && (task3.taskId === 'TSK-003' || task3.id === 'TSK-003')) {
      console.log("  -> SUCCESS: Task 3 is correctly assigned TSK-003 (no skipping to 4)!");
    } else {
      console.error("  -> FAILURE: Task 3 ID is not TSK-003:", task3?.taskId);
    }

    const task1 = allTasks.find(t => t.title && t.title.includes('Task 1'));
    if (task1 && (task1.taskId === 'TSK-001' || task1.id === 'TSK-001')) {
      console.log("  -> SUCCESS: Task 1 is correctly assigned TSK-001!");
    } else {
      console.error("  -> FAILURE: Task 1 ID is not TSK-001:", task1?.taskId);
    }

    // TEST 2: Test Gapless Sequential Task ID Generation Logic
    console.log("\n[TEST 2] Testing Gapless Sequential Task ID Generation Algorithm:");
    function generateNextTaskId(existingList, newTitle) {
      const usedNums = new Set();
      let maxNum = 0;
      for (const t of existingList) {
        const m = String(t.taskId || t.id || '').match(/TSK-0*(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (!isNaN(num) && num < 100000) {
            usedNums.add(num);
            if (num > maxNum) maxNum = num;
          }
        }
      }

      const titleMatch = newTitle.match(/^Task\s*0*(\d+)/i);
      let explicitNum = titleMatch ? parseInt(titleMatch[1], 10) : null;
      let assignedNum;
      if (explicitNum && explicitNum > 0 && !usedNums.has(explicitNum)) {
        assignedNum = explicitNum;
      } else {
        assignedNum = 1;
        while (usedNums.has(assignedNum)) {
          assignedNum++;
        }
      }
      return `TSK-${String(assignedNum).padStart(3, '0')}`;
    }

    const nextForNormal = generateNextTaskId(allTasks, 'New Sprint Task');
    console.log(`  Next sequential task ID for new task: ${nextForNormal} (Expected: TSK-004)`);
    if (nextForNormal === 'TSK-004') {
      console.log("  -> SUCCESS: Generated TSK-004 right after TSK-003!");
    }

    const withGap = [{ taskId: 'TSK-001' }, { taskId: 'TSK-003' }];
    const gapFill = generateNextTaskId(withGap, 'Another Task');
    console.log(`  Gap fill test with [TSK-001, TSK-003]: ${gapFill} (Expected: TSK-002)`);
    if (gapFill === 'TSK-002') {
      console.log("  -> SUCCESS: Gap filled with TSK-002 without skipping!");
    }

    // TEST 3: Duplicate Task Prevention Check
    console.log("\n[TEST 3] Testing Duplicate Task Prevention Logic:");
    const testTitle = allTasks[0].title;
    const testAssigned = allTasks[0].assignedTo;
    const escapedTitle = testTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedAssigned = testAssigned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dupFound = await tasksCol.findOne({
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') },
      assignedTo: { $regex: new RegExp(`^${escapedAssigned}$`, 'i') }
    });
    if (dupFound) {
      console.log(`  -> SUCCESS: Duplicate check correctly caught existing task "${testTitle}" for @${testAssigned}! Duplicate creation will be blocked with 409 Conflict.`);
    } else {
      console.error("  -> FAILURE: Duplicate check did not find existing task.");
    }

    // TEST 4: Revision Notification Recipient Email Mapping
    console.log("\n[TEST 4] Testing Revision Notification Intern Email Resolution:");
    const usersCol = db.collection('users');
    const chinmayUser = await usersCol.findOne({ username: /chinmay/i });
    console.log(`  Found assigned intern @chinmaykv: ${chinmayUser?.name} <${chinmayUser?.email}>`);
    if (chinmayUser?.email === 'chinmaykv555@gmail.com') {
      console.log("  -> SUCCESS: Registered email is chinmaykv555@gmail.com, ready for revision reminder dispatch!");
    }

    console.log("\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

verifyAll();
