export const FUNCTIONS_CODE = `
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const COOLDOWN_MINUTES = 3;

/**
 * Firestore Trigger to handle notifications with full context (HU-05).
 */
export const onTicketCreated = functions.firestore
  .document("supportTickets/{ticketId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const ticketId = context.params.ticketId;
    const deviceId = data.deviceId;

    // HU-09: Spam prevention / Cooldown check
    const now = admin.firestore.Timestamp.now();
    const cooldownRef = db.collection("deviceCooldowns").doc(deviceId);
    const cooldownDoc = await cooldownRef.get();

    if (cooldownDoc.exists) {
      const lastRequest = cooldownDoc.data()?.lastRequestAt as admin.firestore.Timestamp;
      const diffMin = (now.toMillis() - lastRequest.toMillis()) / (1000 * 60);
      
      // If there's an active ticket or cooldown is active, we log but don't notify again
      if (diffMin < COOLDOWN_MINUTES) {
        console.log(\`Spam prevented for device \${deviceId}. Diff: \${diffMin} min\`);
        return;
      }
    }

    // HU-05: Send Notification with context
    const message = {
      topic: "support",
      notification: {
        title: \`¡Soporte \${data.priority.toUpperCase()}! - \${data.category.replaceAll('_', ' ')}\`,
        body: \`Solicitante: \${data.requesterName}. Sala: \${data.room}. Ticket: \${ticketId}\`,
      },
      data: {
        ticketId: ticketId,
        room: data.room,
        priority: data.priority,
        category: data.category,
        requesterName: data.requesterName,
      }
    };

    try {
      await admin.messaging().send(message);
      
      // Update cooldown and ticket
      await cooldownRef.set({ lastRequestAt: now }, { merge: true });
      return snapshot.ref.update({ 
        notified: true, 
        updatedAt: now,
        pendingNotification: false 
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  });

/**
 * Optional: Function to update ticket status (HU-08 simulation)
 */
export const updateTicketStatus = functions.https.onCall(async (data, context) => {
  const { ticketId, newStatus, assignedTo } = data;
  
  // In a real app, check context.auth for admin roles
  
  const now = admin.firestore.Timestamp.now();
  await db.collection("supportTickets").doc(ticketId).update({
    status: newStatus,
    assignedTo: assignedTo || null,
    updatedAt: now,
  });

  return { success: true };
});
`;
