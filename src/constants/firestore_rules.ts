export const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // HU-03: Allow tablets to create tickets with full form data
    match /supportTickets/{ticketId} {
      allow create: if request.resource.data.room == "Sala de juntas" 
                   && request.resource.data.status == "open"
                   && request.resource.data.requestedBy == "tablet"
                   && request.resource.data.requesterName != ""
                   && request.resource.data.priority in ["baja", "media", "alta"]
                   && request.resource.data.category in ["video_beam", "general_support"];
      
      // HU-06: Allow tablets to read their own tickets to track status
      // In a real app, we would use Auth UID or a device token check
      allow read: if true; 

      // Only support staff can update (HU-08)
      allow update, delete: if false; 
    }

    match /deviceCooldowns/{deviceId} {
      allow read, write: if false;
    }
  }
}
`;
